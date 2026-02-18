import { createRoute } from "@hono/zod-openapi";
import { LogoutResponseSchema } from "./logout.schema";

export const LogoutRoute = createRoute({
	method: "post",
	path: "/logout",
	tags: ["Auth"],
	summary: "Encerrar Sessão (Logout)",
	description: "Invalida o refresh token e limpa os cookies de autenticação do navegador.",
	responses: {
		200: {
			description: "Logout realizado com sucesso",
			content: {
				"application/json": {
					schema: LogoutResponseSchema,
				},
			},
		},
	},
});
