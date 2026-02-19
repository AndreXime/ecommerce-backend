import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { CategoryCreateBodySchema, CategoryCreateResponseSchema } from "./create.schema";

export const CategoryCreateRoute = createRoute({
	method: "post",
	path: "/",
	tags: ["Categories"],
	summary: "Criar categoria",
	description: "Cria uma nova categoria de produtos no catálogo.",
	security: [{ Bearer: [] }],
	middleware: [auth(["ADMIN"])],
	request: {
		body: { content: { "application/json": { schema: CategoryCreateBodySchema } } },
	},
	responses: {
		201: {
			description: "Categoria criada",
			content: { "application/json": { schema: CategoryCreateResponseSchema } },
		},
		401: { description: "Não autenticado" },
		403: { description: "Acesso negado (Requer ADMIN)" },
	},
});
