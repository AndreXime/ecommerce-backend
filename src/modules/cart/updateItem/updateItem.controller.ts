import { CartUpdateItemRoute } from "./updateItem.docs";
import { updateCartItem } from "./updateItem.service";

export const registerRoutesCartUpdateItem = (server: ServerType) => {
	server.openapi(CartUpdateItemRoute, async (ctx) => {
		const { id } = ctx.get("user");
		const { productId } = ctx.req.valid("param");
		const body = ctx.req.valid("json");
		const cart = await updateCartItem(id, productId, body);
		return ctx.json(cart, 200);
	});
};
