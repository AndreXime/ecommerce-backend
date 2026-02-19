import { createRoute } from "@hono/zod-openapi";
import { ProductListQuerySchema, ProductListResponseSchema } from "./list.schema";

export const ProductListRoute = createRoute({
	method: "get",
	path: "/",
	tags: ["Products"],
	summary: "Listar produtos",
	description:
		"Retorna produtos paginados com suporte a filtros por categoria, faixa de preço, disponibilidade em estoque e busca textual por nome ou tag.",
	request: {
		query: ProductListQuerySchema,
	},
	responses: {
		200: {
			description: "Lista de produtos",
			content: { "application/json": { schema: ProductListResponseSchema } },
		},
	},
});
