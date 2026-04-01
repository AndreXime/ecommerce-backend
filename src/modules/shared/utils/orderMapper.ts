import type { Order, OrderItem } from "@/database/client/client";
import type { OrderStatusValue } from "@/modules/orders/shared/status";

type OrderWithItems = Order & { items: OrderItem[] };

export function toOrder(order: OrderWithItems) {
	return {
		id: order.id,
		date: order.createdAt.toISOString(),
		total: Number(order.total),
		status: order.status as OrderStatusValue,
		items: order.items.map((item) => ({
			id: item.id,
			name: item.name,
			variant: item.variant,
			img: item.img,
			quantity: item.quantity,
			price: Number(item.unitPrice),
			unitPrice: Number(item.unitPrice),
			discountPercentage: item.discountPercentage !== null ? Number(item.discountPercentage) : null,
			subtotal: Number(item.subtotal),
		})),
	};
}
