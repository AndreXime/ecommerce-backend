import { createRoute } from "@hono/zod-openapi";
import { CategoryListResponseSchema } from "./list.schema";

export const CategoryListRoute = createRoute({
	method: "get",
	path: "/",
	tags: ["Categories"],
	summary: "Listar categorias",
	responses: {
		200: {
			description: "Lista de categorias",
			content: { "application/json": { schema: CategoryListResponseSchema } },
		},
	},
});
