import { createRoute } from "@hono/zod-openapi";
import { ProductGetResponseSchema, ProductIdParamSchema } from "./get.schema";

export const ProductGetRoute = createRoute({
	method: "get",
	path: "/:id",
	tags: ["Products"],
	summary: "Detalhes do produto",
	description: "Retorna os detalhes completos de um produto, incluindo imagens (com id), opções e reviews.",
	request: {
		params: ProductIdParamSchema,
	},
	responses: {
		200: {
			description: "Produto encontrado",
			content: { "application/json": { schema: ProductGetResponseSchema } },
		},
		404: { description: "Produto não encontrado" },
	},
});
