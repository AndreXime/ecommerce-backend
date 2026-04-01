import { HTTPException } from "hono/http-exception";
import type { OrderStatus } from "@/database/client/enums";
import { database } from "@/database/database";
import { toOrder } from "@/modules/shared/utils/orderMapper";
import { assertValidOrderStatusTransition } from "../shared/status";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
	const order = await database.$transaction(async (tx) => {
		const currentOrder = await tx.order.findUniqueOrThrow({
			where: { id: orderId },
			include: { items: true },
		});

		assertValidOrderStatusTransition(currentOrder.status, status);

		const updatedOrders = await tx.order.updateMany({
			where: {
				id: orderId,
				status: currentOrder.status,
			},
			data: { status },
		});

		if (updatedOrders.count === 0) {
			throw new HTTPException(409, {
				message: "O status do pedido foi alterado por outra operação. Tente novamente.",
			});
		}

		if (currentOrder.status === "pending" && status === "cancelled") {
			const quantityByProduct = new Map<string, number>();

			for (const item of currentOrder.items) {
				if (!item.productId) {
					continue;
				}

				quantityByProduct.set(item.productId, (quantityByProduct.get(item.productId) ?? 0) + item.quantity);
			}

			for (const [productId, quantity] of quantityByProduct) {
				const restoredProducts = await tx.product.updateMany({
					where: {
						id: productId,
						quantitySold: { gte: quantity },
					},
					data: {
						stockQuantity: { increment: quantity },
						quantitySold: { decrement: quantity },
						inStock: true,
					},
				});

				if (restoredProducts.count === 0) {
					throw new HTTPException(409, {
						message: "Não foi possível restaurar o estoque do pedido cancelado.",
					});
				}
			}
		}

		return tx.order.findUniqueOrThrow({
			where: { id: orderId },
			include: { items: true },
		});
	});

	return toOrder(order);
}
