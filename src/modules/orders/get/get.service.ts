import { database } from "@/database/database";
import { toOrder } from "@/modules/shared/utils/orderMapper";

export async function getOrder(orderId: string, userId: string, isAdmin: boolean) {
	const order = await database.order.findFirst({
		where: { id: orderId, ...(isAdmin ? {} : { userId }) },
		include: { items: true },
	});

	if (!order) return null;

	return toOrder(order);
}
