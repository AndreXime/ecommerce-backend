import { createRoute } from "@hono/zod-openapi";
import { ResetPasswordBodySchema, ResetPasswordResponseSchema } from "./resetPassword.schema";

export const ResetPasswordRoute = createRoute({
	method: "post",
	path: "/reset-password",
	tags: ["Auth"],
	summary: "Redefinir senha",
	description:
		"Valida o token recebido por email, atualiza a senha e revoga todos os refresh tokens ativos do usuário.",
	request: {
		body: { content: { "application/json": { schema: ResetPasswordBodySchema } } },
	},
	responses: {
		200: {
			description: "Senha redefinida com sucesso",
			content: { "application/json": { schema: ResetPasswordResponseSchema } },
		},
		400: { description: "Token inválido ou expirado" },
	},
});
