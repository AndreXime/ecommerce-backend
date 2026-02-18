import { createRoute } from "@hono/zod-openapi";
import { ForgotPasswordBodySchema, ForgotPasswordResponseSchema } from "./forgotPassword.schema";

export const ForgotPasswordRoute = createRoute({
	method: "post",
	path: "/forgot-password",
	tags: ["Auth"],
	summary: "Solicitar redefinição de senha",
	description:
		"Envia um email com link de redefinição se o endereço estiver cadastrado. A resposta é sempre a mesma independente do email existir ou não, para evitar enumeração de usuários.",
	request: {
		body: { content: { "application/json": { schema: ForgotPasswordBodySchema } } },
	},
	responses: {
		200: {
			description: "Solicitação processada",
			content: { "application/json": { schema: ForgotPasswordResponseSchema } },
		},
	},
});
