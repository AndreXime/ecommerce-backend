import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { ReadUserRequestQuerySchema, ReadUserResponseSchema } from "./readUser.schema";

export const ReadUserRoute = createRoute({
	method: "get",
	path: "/",
	tags: ["User"],
	summary: "Obter todos os perfis",
	description: "Retorna todos os dados de usuários com paginação.",
	request: {
		query: ReadUserRequestQuerySchema,
	},
	security: [
		{
			Bearer: [],
		},
	],
	middleware: [auth(["ADMIN"])],
	responses: {
		200: {
			description: "Lista de usuários recuperada com sucesso",
			content: {
				"application/json": {
					schema: ReadUserResponseSchema,
				},
			},
		},
		401: {
			description: "Não autenticado",
		},
		403: {
			description: "Acesso negado (Requer ADMIN)",
		},
	},
});
