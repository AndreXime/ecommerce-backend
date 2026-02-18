import { createRoute } from "@hono/zod-openapi";
import { LoginRequestSchema, LoginResponseSchema } from "./login.schema";

export const LoginRoute = createRoute({
	method: "post",
	path: "/login",
	tags: ["Auth"],
	summary: "Login de Usuário",
	description: "Autentica o usuário via e-mail e senha e define os cookies de sessão (HttpOnly).",
	request: {
		body: {
			content: {
				"application/json": {
					schema: LoginRequestSchema,
				},
			},
			description: "Credenciais do usuário",
			required: true,
		},
	},
	responses: {
		200: {
			description: "Login realizado com sucesso",
			content: {
				"application/json": {
					schema: LoginResponseSchema,
				},
			},
		},
		401: {
			description: "Senha inválida ou credenciais incorretas",
		},
		404: {
			description: "Usuário não encontrado",
		},
	},
});
