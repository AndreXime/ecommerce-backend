import { OrderCreateRoute } from "./create.docs";
import { createOrder } from "./create.service";

export const registerRoutesOrderCreate = (server: ServerType) => {
	server.openapi(OrderCreateRoute, async (ctx) => {
		const { id } = ctx.get("user");
		const body = ctx.req.valid("json");

		try {
			const order = await createOrder(id, body);
			return ctx.json(order, 201);
		} catch (err) {
			if (err instanceof Error && err.message === "EMPTY_CART") {
				return ctx.json({ message: "Carrinho está vazio" }, 400);
			}
			throw err;
		}
	});
};
