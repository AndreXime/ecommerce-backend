import { ProductGetRoute } from "./get.docs";
import { getProductById } from "./get.service";

export const registerRoutesProductGet = (server: ServerType) => {
	server.openapi(ProductGetRoute, async (ctx) => {
		const { id } = ctx.req.valid("param");
		const product = await getProductById(id);

		if (!product) return ctx.json({ message: "Produto não encontrado" }, 404);

		return ctx.json(product, 200);
	});
};
