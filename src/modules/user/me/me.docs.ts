import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { MeResponseSchema } from "./me.schema";

export const MeRoute = createRoute({
	method: "get",
	path: "/me",
	tags: ["User"],
	summary: "Obter perfil completo",
	description: "Retorna todos os dados do usuário autenticado: dados pessoais, pedidos, wishlist, cartões e endereços.",
	security: [{ Bearer: [] }],
	middleware: [auth([])],
	responses: {
		200: {
			description: "Perfil completo do usuário",
			content: { "application/json": { schema: MeResponseSchema } },
		},
		401: { description: "Não autorizado" },
	},
});
