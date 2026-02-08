import { createRoute, z } from "@hono/zod-openapi";

export const RefreshRoute = createRoute({
	method: "post",
	path: "/refresh",
	tags: ["Auth"],
	summary: "Renovar Sessão (Refresh Token)",
	description: "Usa o cookie HTTP-only 'refreshToken' para gerar um novo par de tokens de acesso.",
	request: {
		// Definimos que essa rota espera um Cookie
		cookies: z.object({
			refreshToken: z.string().openapi({ description: "Token de atualização (HttpOnly)" }),
		}),
	},
	responses: {
		200: {
			description: "Sessão renovada com sucesso",
			content: {
				"application/json": {
					schema: z.object({
						message: z.string().openapi({ example: "Sessão renovada com sucesso" }),
					}),
				},
			},
		},
		401: {
			description: "Refresh token inválido, expirado ou não fornecido.",
		},
	},
});
