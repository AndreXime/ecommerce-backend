import { createRoute } from "@hono/zod-openapi";
import { RefreshRequestSchema, RefreshResponseSchema } from "./refresh.schema";

export const RefreshRoute = createRoute({
	method: "post",
	path: "/refresh",
	tags: ["Auth"],
	summary: "Renovar Sessão (Refresh Token)",
	description: "Usa o cookie HTTP-only 'refreshToken' para gerar um novo par de tokens de acesso.",
	request: {
		cookies: RefreshRequestSchema,
	},
	responses: {
		200: {
			description: "Sessão renovada com sucesso",
			content: {
				"application/json": {
					schema: RefreshResponseSchema,
				},
			},
		},
		401: {
			description: "Refresh token inválido, expirado ou não fornecido.",
		},
	},
});
