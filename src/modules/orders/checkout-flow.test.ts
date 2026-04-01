import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { sign } from "hono/jwt";
import type { Roles } from "@/database/client/enums";
import { database } from "@/database/database";
import app from "@/index";
import environment from "@/lib/environment";
import { hashPassword } from "@/modules/auth/shared/hash";

interface AuthenticatedUser {
	readonly id: string;
	readonly email: string;
	readonly name: string;
	readonly role: Roles;
	readonly sessionVersion: number;
}

interface OrderItemResponse {
	readonly id: string;
	readonly name: string;
	readonly variant?: string | null;
	readonly img?: string | null;
	readonly quantity: number;
	readonly price: number;
	readonly unitPrice: number;
	readonly discountPercentage?: number | null;
	readonly subtotal: number;
}

interface OrderResponse {
	readonly id: string;
	readonly date: string;
	readonly total: number;
	readonly status: "pending" | "intransit" | "delivered" | "cancelled";
	readonly items: ReadonlyArray<OrderItemResponse>;
}

describe("Checkout flow", () => {
	const suffix = Date.now();
	const categoryName = `Checkout Category ${suffix}`;
	const customerEmail = `checkout_customer_${suffix}@example.com`;
	const adminEmail = `checkout_admin_${suffix}@example.com`;

	let customerToken = "";
	let adminToken = "";
	let categoryId = "";
	let configurableProductId = "";
	let limitedProductId = "";
	let statusProductId = "";
	let customerId = "";
	let adminId = "";

	beforeAll(async () => {
		const hashedPassword = await hashPassword("123456");

		const [category, customer, admin] = await Promise.all([
			database.category.create({
				data: { name: categoryName },
			}),
			database.user.create({
				data: {
					name: "Checkout Customer",
					email: customerEmail,
					password: hashedPassword,
				},
			}),
			database.user.create({
				data: {
					name: "Checkout Admin",
					email: adminEmail,
					password: hashedPassword,
					role: "ADMIN",
				},
			}),
		]);

		categoryId = category.id;
		customerId = customer.id;
		adminId = admin.id;
		customerToken = await createToken(customer);
		adminToken = await createToken(admin);

		const [configurableProduct, limitedProduct, statusProduct] = await Promise.all([
			database.product.create({
				data: {
					name: "Configurable Product",
					tag: `configurable-product-${suffix}`,
					price: 100,
					discountPercentage: 20,
					description: "Produto configurável usado nos testes de checkout.",
					categoryId,
					stockQuantity: 5,
					inStock: true,
					options: {
						create: [
							{ label: "Color", uiType: "color", values: ["black", "white"] },
							{ label: "Size", uiType: "pill", values: ["M", "G"] },
						],
					},
				},
			}),
			database.product.create({
				data: {
					name: "Limited Product",
					tag: `limited-product-${suffix}`,
					price: 50,
					description: "Produto com estoque baixo para testar bloqueio transacional.",
					categoryId,
					stockQuantity: 1,
					inStock: true,
				},
			}),
			database.product.create({
				data: {
					name: "Status Product",
					tag: `status-product-${suffix}`,
					price: 75,
					description: "Produto para testar transições inválidas de status.",
					categoryId,
					stockQuantity: 3,
					inStock: true,
				},
			}),
		]);

		configurableProductId = configurableProduct.id;
		limitedProductId = limitedProduct.id;
		statusProductId = statusProduct.id;
	});

	afterAll(async () => {
		const productIds = [configurableProductId, limitedProductId, statusProductId].filter(Boolean);
		const userIds = [customerId, adminId].filter(Boolean);

		if (userIds.length > 0) {
			await database.order.deleteMany({
				where: {
					OR: userIds.map((id) => ({ userId: id })),
				},
			});
			await database.cart.deleteMany({
				where: { userId: { in: userIds } },
			});
		}

		if (productIds.length > 0) {
			await database.product.deleteMany({
				where: {
					id: { in: productIds },
				},
			});
		}

		if (categoryId) {
			await database.category.deleteMany({
				where: { id: categoryId },
			});
		}

		if (userIds.length > 0) {
			await database.user.deleteMany({
				where: { id: { in: userIds } },
			});
		}
	});

	test("rejeita variante inválida no carrinho", async () => {
		const res = await app.request("/cart/items", {
			method: "POST",
			headers: makeJsonHeaders(customerToken),
			body: JSON.stringify({
				productId: configurableProductId,
				quantity: 1,
				selectedVariant: {
					Color: "black",
					Material: "cotton",
				},
			}),
		});

		expect(res.status).toBe(400);
		const body = (await res.json()) as { message: string };
		expect(body.message).toContain("não existe");
	});

	test("bloqueia pedido com estoque insuficiente sem consumir estoque", async () => {
		const res = await app.request("/orders", {
			method: "POST",
			headers: makeJsonHeaders(customerToken),
			body: JSON.stringify({
				items: [
					{
						productId: limitedProductId,
						quantity: 2,
					},
				],
			}),
		});

		expect(res.status).toBe(409);
		const body = (await res.json()) as { message: string };
		expect(body.message).toContain("Estoque insuficiente");

		const product = await database.product.findUniqueOrThrow({
			where: { id: limitedProductId },
			select: { stockQuantity: true, inStock: true },
		});

		expect(product.stockQuantity).toBe(1);
		expect(product.inStock).toBe(true);
	});

	test("congela preço, desconto e subtotal do item do pedido", async () => {
		const createRes = await app.request("/orders", {
			method: "POST",
			headers: makeJsonHeaders(customerToken),
			body: JSON.stringify({
				items: [
					{
						productId: configurableProductId,
						quantity: 2,
						selectedVariant: {
							Color: "black",
							Size: "M",
						},
					},
				],
			}),
		});

		expect(createRes.status).toBe(201);
		const createdOrder = (await createRes.json()) as OrderResponse;

		expect(createdOrder.status).toBe("pending");
		expect(createdOrder.total).toBe(160);
		expect(createdOrder.items).toHaveLength(1);
		expect(createdOrder.items[0]?.price).toBe(80);
		expect(createdOrder.items[0]?.unitPrice).toBe(80);
		expect(createdOrder.items[0]?.discountPercentage).toBe(20);
		expect(createdOrder.items[0]?.subtotal).toBe(160);

		await database.product.update({
			where: { id: configurableProductId },
			data: {
				price: 999,
				discountPercentage: null,
			},
		});

		const getRes = await app.request(`/orders/${createdOrder.id}`, {
			headers: makeJsonHeaders(customerToken),
		});

		expect(getRes.status).toBe(200);
		const fetchedOrder = (await getRes.json()) as OrderResponse;

		expect(fetchedOrder.items[0]?.price).toBe(80);
		expect(fetchedOrder.items[0]?.unitPrice).toBe(80);
		expect(fetchedOrder.items[0]?.discountPercentage).toBe(20);
		expect(fetchedOrder.items[0]?.subtotal).toBe(160);

		const product = await database.product.findUniqueOrThrow({
			where: { id: configurableProductId },
			select: { stockQuantity: true, inStock: true },
		});

		expect(product.stockQuantity).toBe(3);
		expect(product.inStock).toBe(true);
	});

	test("rejeita transição inválida de status", async () => {
		const createRes = await app.request("/orders", {
			method: "POST",
			headers: makeJsonHeaders(customerToken),
			body: JSON.stringify({
				items: [
					{
						productId: statusProductId,
						quantity: 1,
					},
				],
			}),
		});

		expect(createRes.status).toBe(201);
		const createdOrder = (await createRes.json()) as OrderResponse;

		const updateRes = await app.request(`/orders/${createdOrder.id}/status`, {
			method: "PATCH",
			headers: makeJsonHeaders(adminToken),
			body: JSON.stringify({
				status: "delivered",
			}),
		});

		expect(updateRes.status).toBe(400);
		const body = (await updateRes.json()) as { message: string };
		expect(body.message).toContain("Transição de status inválida");
	});

	test("cancela pedido pendente devolvendo estoque e quantitySold", async () => {
		const cancelProduct = await database.product.create({
			data: {
				name: "Cancelable Product",
				tag: `cancelable-product-${crypto.randomUUID()}`,
				price: 60,
				description: "Produto dedicado ao teste de cancelamento com estorno.",
				categoryId,
				stockQuantity: 2,
				inStock: true,
			},
		});

		try {
			const createRes = await app.request("/orders", {
				method: "POST",
				headers: makeJsonHeaders(customerToken),
				body: JSON.stringify({
					items: [
						{
							productId: cancelProduct.id,
							quantity: 2,
						},
					],
				}),
			});

			expect(createRes.status).toBe(201);
			const createdOrder = (await createRes.json()) as OrderResponse;

			const reservedProduct = await database.product.findUniqueOrThrow({
				where: { id: cancelProduct.id },
				select: { stockQuantity: true, quantitySold: true, inStock: true },
			});

			expect(reservedProduct.stockQuantity).toBe(0);
			expect(reservedProduct.quantitySold).toBe(2);
			expect(reservedProduct.inStock).toBe(false);

			const cancelRes = await app.request(`/orders/${createdOrder.id}/status`, {
				method: "PATCH",
				headers: makeJsonHeaders(adminToken),
				body: JSON.stringify({
					status: "cancelled",
				}),
			});

			expect(cancelRes.status).toBe(200);
			const cancelledOrder = (await cancelRes.json()) as OrderResponse;
			expect(cancelledOrder.status).toBe("cancelled");

			const restoredProduct = await database.product.findUniqueOrThrow({
				where: { id: cancelProduct.id },
				select: { stockQuantity: true, quantitySold: true, inStock: true },
			});

			expect(restoredProduct.stockQuantity).toBe(2);
			expect(restoredProduct.quantitySold).toBe(0);
			expect(restoredProduct.inStock).toBe(true);
		} finally {
			await database.product.delete({
				where: { id: cancelProduct.id },
			});
		}
	});
});

function makeJsonHeaders(token: string) {
	return {
		"Content-Type": "application/json",
		Authorization: `Bearer ${token}`,
		Origin: environment.FRONTEND_URL,
	};
}

async function createToken(user: AuthenticatedUser) {
	return sign(
		{
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
			jti: crypto.randomUUID(),
			sessionVersion: user.sessionVersion,
			exp: Math.floor(Date.now() / 1000) + 60 * 5,
		},
		environment.JWT_SECRET,
	);
}
