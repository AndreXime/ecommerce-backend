import { WishlistToggleRoute } from "./toggle.docs";
import { toggleWishlist } from "./toggle.service";

export const registerRoutesWishlistToggle = (server: ServerType) => {
	server.openapi(WishlistToggleRoute, async (ctx) => {
		const { id } = ctx.get("user");
		const { productId } = ctx.req.valid("param");
		const result = await toggleWishlist(id, productId);
		return ctx.json(result, 200);
	});
};
