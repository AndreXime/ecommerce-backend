import { createRoute } from "@hono/zod-openapi";
import { RegisterRequestSchema, RegisterResponseSchema } from "./register.schema";

export const RegisterRoute = createRoute({
	method: "post",
	path: "/register",
	tags: ["Auth"],
	summary: "Registrar novo usuário",
	description: "Cria uma nova conta de usuário e inicia a sessão automaticamente.",
	request: {
		body: {
			content: {
				"application/json": {
					schema: RegisterRequestSchema,
				},
			},
			required: true,
		},
	},
	responses: {
		201: {
			description: "Usuário criado com sucesso",
			content: {
				"application/json": {
					schema: RegisterResponseSchema,
				},
			},
		},
		409: {
			description: "Conflito: E-mail já cadastrado",
		},
		400: {
			description: "Erro de validação (ex: senhas não conferem)",
		},
	},
});
