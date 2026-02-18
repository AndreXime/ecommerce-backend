import { OrderListRoute } from "./list.docs";
import { listOrders } from "./list.service";

export const registerRoutesOrderList = (server: ServerType) => {
	server.openapi(OrderListRoute, async (ctx) => {
		const { id, role } = ctx.get("user");
		const query = ctx.req.valid("query");
		const result = await listOrders(id, role === "ADMIN", query);
		return ctx.json(result, 200);
	});
};
