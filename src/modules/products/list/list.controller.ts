import { ProductListRoute } from "./list.docs";
import { listProducts } from "./list.service";

export const registerRoutesProductList = (server: ServerType) => {
	server.openapi(ProductListRoute, async (ctx) => {
		const query = ctx.req.valid("query");
		const result = await listProducts(query);
		return ctx.json(result, 200);
	});
};
