import { CartAddItemRoute } from "./addItem.docs";
import { addCartItem } from "./addItem.service";

export const registerRoutesCartAddItem = (server: ServerType) => {
	server.openapi(CartAddItemRoute, async (ctx) => {
		const { id } = ctx.get("user");
		const body = ctx.req.valid("json");
		const cart = await addCartItem(id, body);
		return ctx.json(cart, 200);
	});
};
