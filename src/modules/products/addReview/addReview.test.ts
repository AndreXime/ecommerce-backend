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

interface ReviewResponse {
	readonly id: string;
	readonly author: string;
	readonly avatar?: string | null;
	readonly initials?: string | null;
	readonly rating: number;
	readonly date: string;
	readonly title: string;
	readonly content: string;
}

describe("Add product review", () => {
	const suffix = Date.now();
	const categoryName = `Review Category ${suffix}`;
	const productTag = `review-product-${suffix}`;
	const noOrderEmail = `review_no_order_${suffix}@example.com`;
	const pendingEmail = `review_pending_${suffix}@example.com`;
	const deliveredEmail = `review_delivered_${suffix}@example.com`;

	let categoryId = "";
	let productId = "";
	let noOrderUserId = "";
	let pendingUserId = "";
	let deliveredUserId = "";
	let noOrderToken = "";
	let pendingToken = "";
	let deliveredToken = "";

	beforeAll(async () => {
		const hashedPassword = await hashPassword("123456");

		const [category, noOrderUser, pendingUser, deliveredUser] = await Promise.all([
			database.category.create({
				data: { name: categoryName },
			}),
			database.user.create({
				data: {
					name: "Review No Order",
					email: noOrderEmail,
					password: hashedPassword,
				},
			}),
			database.user.create({
				data: {
					name: "Review Pending",
					email: pendingEmail,
					password: hashedPassword,
				},
			}),
			database.user.create({
				data: {
					name: "Review Delivered",
					email: deliveredEmail,
					password: hashedPassword,
				},
			}),
		]);

		categoryId = category.id;
		noOrderUserId = noOrderUser.id;
		pendingUserId = pendingUser.id;
		deliveredUserId = deliveredUser.id;

		noOrderToken = await createToken(noOrderUser);
		pendingToken = await createToken(pendingUser);
		deliveredToken = await createToken(deliveredUser);

		const product = await database.product.create({
			data: {
				name: "Review Product",
				tag: productTag,
				price: 120,
				description: "Produto dedicado aos testes de review.",
				categoryId,
				stockQuantity: 10,
				inStock: true,
			},
		});

		productId = product.id;

		await Promise.all([
			database.order.create({
				data: {
					userId: pendingUserId,
					status: "pending",
					total: 120,
					items: {
						create: [
							{
								name: product.name,
								quantity: 1,
								unitPrice: product.price,
								subtotal: product.price,
								productId: product.id,
							},
						],
					},
				},
			}),
			database.order.create({
				data: {
					userId: deliveredUserId,
					status: "delivered",
					total: 120,
					items: {
						create: [
							{
								name: product.name,
								quantity: 1,
								unitPrice: product.price,
								subtotal: product.price,
								productId: product.id,
							},
						],
					},
				},
			}),
		]);
	});

	afterAll(async () => {
		const userIds = [noOrderUserId, pendingUserId, deliveredUserId].filter(Boolean);

		if (userIds.length > 0) {
			await database.order.deleteMany({
				where: {
					userId: {
						in: userIds,
					},
				},
			});

			await database.review.deleteMany({
				where: {
					userId: {
						in: userIds,
					},
				},
			});
		}

		if (productId) {
			await database.product.deleteMany({
				where: { id: productId },
			});
		}

		if (categoryId) {
			await database.category.deleteMany({
				where: { id: categoryId },
			});
		}

		if (userIds.length > 0) {
			await database.user.deleteMany({
				where: {
					id: {
						in: userIds,
					},
				},
			});
		}
	});

	test("usuário sem compra elegível não pode avaliar", async () => {
		const response = await app.request(`/products/${productId}/reviews`, {
			method: "POST",
			headers: makeJsonHeaders(noOrderToken),
			body: JSON.stringify(makeReviewBody("Tentativa sem compra")),
		});

		expect(response.status).toBe(403);
		const body = (await response.json()) as { message: string };
		expect(body.message).toContain("pedido entregue");
	});

	test("usuário com pedido pending não pode avaliar", async () => {
		const response = await app.request(`/products/${productId}/reviews`, {
			method: "POST",
			headers: makeJsonHeaders(pendingToken),
			body: JSON.stringify(makeReviewBody("Tentativa pendente")),
		});

		expect(response.status).toBe(403);
		const body = (await response.json()) as { message: string };
		expect(body.message).toContain("pedido entregue");
	});

	test("usuário com pedido delivered pode avaliar", async () => {
		const response = await app.request(`/products/${productId}/reviews`, {
			method: "POST",
			headers: makeJsonHeaders(deliveredToken),
			body: JSON.stringify(makeReviewBody("Compra entregue")),
		});

		expect(response.status).toBe(201);
		const body = (await response.json()) as ReviewResponse;
		expect(body.author).toBe("Review Delivered");
		expect(body.rating).toBe(5);

		const product = await database.product.findUniqueOrThrow({
			where: { id: productId },
			select: { rating: true, reviewsCount: true },
		});

		expect(product.reviewsCount).toBe(1);
		expect(Number(product.rating)).toBe(5);
	});

	test("segunda review do mesmo usuário para o mesmo produto é bloqueada", async () => {
		const response = await app.request(`/products/${productId}/reviews`, {
			method: "POST",
			headers: makeJsonHeaders(deliveredToken),
			body: JSON.stringify(makeReviewBody("Segunda tentativa")),
		});

		expect(response.status).toBe(409);
		const body = (await response.json()) as { message: string };
		expect(body.message).toContain("já avaliou");

		const reviewCount = await database.review.count({
			where: {
				productId,
				userId: deliveredUserId,
			},
		});

		expect(reviewCount).toBe(1);
	});
});

function makeReviewBody(title: string) {
	return {
		rating: 5,
		title,
		content: "Produto excelente para validar as regras de review.",
	};
}

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
