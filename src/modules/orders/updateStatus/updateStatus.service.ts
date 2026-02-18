import type { OrderStatus } from "@/database/client/enums";
import { database } from "@/database/database";
import { toOrder } from "@/modules/shared/utils/orderMapper";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
	const order = await database.order.update({
		where: { id: orderId },
		data: { status },
		include: { items: true },
	});

	return toOrder(order);
}
