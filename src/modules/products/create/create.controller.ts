import { ProductCreateRoute } from "./create.docs";
import { createProduct } from "./create.service";

export const registerRoutesProductCreate = (server: ServerType) => {
	server.openapi(ProductCreateRoute, async (ctx) => {
		const body = ctx.req.valid("json");
		const product = await createProduct(body);
		return ctx.json(product, 201);
	});
};
