import type { OrderStatus } from "@/database/client/enums";
import { OrderUpdateStatusRoute } from "./updateStatus.docs";
import { updateOrderStatus } from "./updateStatus.service";

export const registerRoutesOrderUpdateStatus = (server: ServerType) => {
	server.openapi(OrderUpdateStatusRoute, async (ctx) => {
		const { id } = ctx.req.valid("param");
		const { status } = ctx.req.valid("json");
		const order = await updateOrderStatus(id, status as OrderStatus);
		return ctx.json(order, 200);
	});
};
