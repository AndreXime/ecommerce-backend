import { OrderCreateRoute } from "./create.docs";
import { createOrder } from "./create.service";

export const registerRoutesOrderCreate = (server: ServerType) => {
	server.openapi(OrderCreateRoute, async (ctx) => {
		const { id } = ctx.get("user");
		const body = ctx.req.valid("json");
		const order = await createOrder(id, body);
		return ctx.json(order, 201);
	});
};
