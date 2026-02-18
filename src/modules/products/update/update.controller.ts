import { ProductUpdateRoute } from "./update.docs";
import { updateProduct } from "./update.service";

export const registerRoutesProductUpdate = (server: ServerType) => {
	server.openapi(ProductUpdateRoute, async (ctx) => {
		const { id } = ctx.req.valid("param");
		const body = ctx.req.valid("json");
		const product = await updateProduct(id, body);
		return ctx.json(product, 200);
	});
};
