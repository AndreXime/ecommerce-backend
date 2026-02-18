import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { MeResponseSchema } from "./me.schema";

export const MeRoute = createRoute({
	method: "get",
	path: "/me",
	tags: ["User"],
	summary: "Obter perfil atual",
	description: "Retorna os dados do usuário autenticado baseado no token enviado.",
	security: [
		{
			Bearer: [],
		},
	],
	middleware: [auth([])],
	responses: {
		200: {
			description: "Perfil do usuário",
			content: {
				"application/json": {
					schema: MeResponseSchema,
				},
			},
		},
		401: {
			description: "Não autorizado",
		},
	},
});
