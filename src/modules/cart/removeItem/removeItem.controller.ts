import { CartRemoveItemRoute } from "./removeItem.docs";
import { removeCartItem } from "./removeItem.service";

export const registerRoutesCartRemoveItem = (server: ServerType) => {
	server.openapi(CartRemoveItemRoute, async (ctx) => {
		const { id } = ctx.get("user");
		const { cartItemId } = ctx.req.valid("param");
		const cart = await removeCartItem(id, cartItemId);
		return ctx.json(cart, 200);
	});
};
