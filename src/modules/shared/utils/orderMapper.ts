import type { Order, OrderItem } from "@/database/client/client";

type OrderWithItems = Order & { items: OrderItem[] };

export function toOrder(order: OrderWithItems) {
	return {
		id: order.id,
		date: order.createdAt.toISOString(),
		total: Number(order.total),
		status: order.status as "delivered" | "intransit" | "cancelled",
		items: order.items.map((item) => ({
			id: item.id,
			name: item.name,
			variant: item.variant,
			img: item.img,
			quantity: item.quantity,
			price: Number(item.price),
		})),
	};
}
