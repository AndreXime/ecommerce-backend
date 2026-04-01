import type { z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { database } from "@/database/database";
import { toOrder } from "@/modules/shared/utils/orderMapper";
import { formatSelectedVariant, validateSelectedVariant } from "@/modules/shared/utils/variantValidation";
import type { OrderCreateBodySchema } from "./create.schema";

type Body = z.infer<typeof OrderCreateBodySchema>;
type SourceItem = {
	productId: string;
	quantity: number;
	selectedVariant?: Record<string, string>;
};

export async function createOrder(userId: string, body: Body) {
	const sourceItems = await resolveSourceItems(userId, body);

	const order = await database.$transaction(async (tx) => {
		const products = await tx.product.findMany({
			where: { id: { in: sourceItems.map((item) => item.productId) } },
			include: {
				images: { orderBy: { position: "asc" }, take: 1 },
				options: { orderBy: { label: "asc" } },
			},
		});
		const productMap = new Map(products.map((product) => [product.id, product] as const));
		const requestedQuantityByProduct = new Map<string, number>();

		const orderItemsData = sourceItems.map((item) => {
			const product = productMap.get(item.productId);

			if (!product) {
				throw new HTTPException(404, {
					message: `Produto "${item.productId}" não encontrado.`,
				});
			}

			const selectedVariant = validateSelectedVariant(item.selectedVariant, product.options, product.name);
			const basePrice = roundMoney(Number(product.price));
			const discountPercentage = product.discountPercentage !== null ? Number(product.discountPercentage) : null;
			const unitPrice = calculateUnitPrice(basePrice, discountPercentage);
			const subtotal = roundMoney(unitPrice * item.quantity);

			requestedQuantityByProduct.set(
				item.productId,
				(requestedQuantityByProduct.get(item.productId) ?? 0) + item.quantity,
			);

			return {
				productId: item.productId,
				name: product.name,
				variant: formatSelectedVariant(selectedVariant, product.options),
				img: product.images[0]?.url ?? null,
				quantity: item.quantity,
				unitPrice,
				discountPercentage,
				subtotal,
			};
		});
		const total = roundMoney(orderItemsData.reduce((sum, item) => sum + item.subtotal, 0));

		for (const [productId, requestedQuantity] of requestedQuantityByProduct) {
			const stockUpdate = await tx.product.updateMany({
				where: {
					id: productId,
					stockQuantity: { gte: requestedQuantity },
				},
				data: {
					stockQuantity: { decrement: requestedQuantity },
					quantitySold: { increment: requestedQuantity },
				},
			});

			if (stockUpdate.count === 0) {
				const product = await tx.product.findUnique({
					where: { id: productId },
					select: { name: true, stockQuantity: true },
				});

				if (!product) {
					throw new HTTPException(404, {
						message: `Produto "${productId}" não encontrado.`,
					});
				}

				throw new HTTPException(409, {
					message: `Estoque insuficiente para "${product.name}". Disponível: ${product.stockQuantity}.`,
				});
			}

			const productWithUpdatedStock = await tx.product.findUniqueOrThrow({
				where: { id: productId },
				select: { stockQuantity: true },
			});

			await tx.product.update({
				where: { id: productId },
				data: { inStock: productWithUpdatedStock.stockQuantity > 0 },
			});
		}

		const newOrder = await tx.order.create({
			data: {
				userId,
				total,
				items: { create: orderItemsData },
			},
			include: { items: true },
		});

		if (!body.items) {
			await tx.cart.update({
				where: { userId },
				data: { items: { deleteMany: {} } },
			});
		}

		return newOrder;
	});

	return toOrder(order);
}

async function resolveSourceItems(userId: string, body: Body): Promise<SourceItem[]> {
	if (body.items) {
		return body.items;
	}

	const cart = await database.cart.findUnique({
		where: { userId },
		include: { items: true },
	});

	if (!cart || cart.items.length === 0) {
		throw new HTTPException(400, { message: "Carrinho está vazio" });
	}

	return cart.items.map((item) => ({
		productId: item.productId,
		quantity: item.quantity,
		selectedVariant: isSelectedVariant(item.selectedVariant) ? item.selectedVariant : undefined,
	}));
}

function calculateUnitPrice(basePrice: number, discountPercentage: number | null) {
	if (!discountPercentage) {
		return basePrice;
	}

	return roundMoney(basePrice * (1 - discountPercentage / 100));
}

function roundMoney(value: number) {
	return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isSelectedVariant(value: unknown): value is Record<string, string> {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return false;
	}

	return Object.values(value).every((variantValue) => typeof variantValue === "string");
}
