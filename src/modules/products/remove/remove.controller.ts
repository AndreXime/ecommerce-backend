import { ProductRemoveRoute } from "./remove.docs";
import { removeProduct } from "./remove.service";

export const registerRoutesProductRemove = (server: ServerType) => {
	server.openapi(ProductRemoveRoute, async (ctx) => {
		const { id } = ctx.req.valid("param");
		await removeProduct(id);
		return ctx.body(null, 204);
	});
};
