import { CartGetRoute } from "./get.docs";
import { getCart } from "./get.service";

export const registerRoutesCartGet = (server: ServerType) => {
	server.openapi(CartGetRoute, async (ctx) => {
		const { id } = ctx.get("user");
		const cart = await getCart(id);
		return ctx.json(cart, 200);
	});
};
