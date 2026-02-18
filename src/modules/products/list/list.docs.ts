import { createRoute } from "@hono/zod-openapi";
import { ProductListQuerySchema, ProductListResponseSchema } from "./list.schema";

export const ProductListRoute = createRoute({
	method: "get",
	path: "/",
	tags: ["Products"],
	summary: "Listar produtos",
	description: "Retorna produtos com paginação e filtros.",
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
