import { HTTPException } from "hono/http-exception";

export const orderStatuses = ["pending", "intransit", "delivered", "cancelled"] as const;

export type OrderStatusValue = (typeof orderStatuses)[number];

const allowedTransitions: Record<OrderStatusValue, ReadonlyArray<OrderStatusValue>> = {
	pending: ["intransit", "cancelled"],
	intransit: ["delivered"],
	delivered: [],
	cancelled: [],
};

export function assertValidOrderStatusTransition(currentStatus: OrderStatusValue, nextStatus: OrderStatusValue) {
	if (currentStatus === nextStatus) {
		throw new HTTPException(400, {
			message: `O pedido já está com status "${currentStatus}".`,
		});
	}

	if (!allowedTransitions[currentStatus].includes(nextStatus)) {
		throw new HTTPException(400, {
			message: `Transição de status inválida: "${currentStatus}" -> "${nextStatus}".`,
		});
	}
}
