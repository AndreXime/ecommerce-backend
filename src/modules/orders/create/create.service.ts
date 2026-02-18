import type { z } from "@hono/zod-openapi";
import { database } from "@/database/database";
import { toOrder } from "@/modules/shared/utils/orderMapper";
import type { OrderCreateBodySchema } from "./create.schema";

type Body = z.infer<typeof OrderCreateBodySchema>;

export async function createOrder(userId: string, body: Body) {
	// Resolve itens: do body ou do carrinho ativo
	let sourceItems: { productId: string; quantity: number; selectedVariant?: Record<string, string> }[];

	if (body.items && body.items.length > 0) {
		sourceItems = body.items as typeof sourceItems;
	} else {
		const cart = await database.cart.findUnique({
			where: { userId },
			include: { items: true },
		});

		if (!cart || cart.items.length === 0) {
			throw new Error("EMPTY_CART");
		}

		sourceItems = cart.items.map((item) => ({
			productId: item.productId,
			quantity: item.quantity,
			selectedVariant: (item.selectedVariant as Record<string, string>) ?? undefined,
		}));
	}

	const products = await database.product.findMany({
		where: { id: { in: sourceItems.map((i) => i.productId) } },
		include: { images: { orderBy: { position: "asc" }, take: 1 } },
	});

	const productMap = new Map(products.map((p) => [p.id, p]));

	const orderItemsData = sourceItems.map((item) => {
		const product = productMap.get(item.productId);
		if (!product) throw new Error(`Produto ${item.productId} não encontrado`);

		const variantLabel = item.selectedVariant ? Object.values(item.selectedVariant).join(", ") : null;

		return {
			productId: item.productId,
			name: product.name,
			variant: variantLabel,
			img: product.images[0]?.url ?? null,
			quantity: item.quantity,
			price: product.price,
		};
	});

	const total = orderItemsData.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);

	const order = await database.$transaction(async (tx) => {
		const newOrder = await tx.order.create({
			data: {
				userId,
				total,
				items: { create: orderItemsData },
			},
			include: { items: true },
		});

		// Incrementa quantitySold nos produtos
		for (const item of orderItemsData) {
			await tx.product.update({
				where: { id: item.productId },
				data: { quantitySold: { increment: item.quantity } },
			});
		}

		// Limpa o carrinho se o pedido foi criado a partir dele
		if (!body.items || body.items.length === 0) {
			await tx.cart.update({
				where: { userId },
				data: { items: { deleteMany: {} } },
			});
		}

		return newOrder;
	});

	return toOrder(order);
}
