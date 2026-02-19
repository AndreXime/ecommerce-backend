import { createRoute } from "@hono/zod-openapi";
import { CategoryListResponseSchema } from "./list.schema";

export const CategoryListRoute = createRoute({
	method: "get",
	path: "/",
	tags: ["Categories"],
	summary: "Listar categorias",
	description: "Retorna todas as categorias disponíveis no catálogo.",
	responses: {
		200: {
			description: "Lista de categorias",
			content: { "application/json": { schema: CategoryListResponseSchema } },
		},
	},
});
