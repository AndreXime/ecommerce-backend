import { z } from "@hono/zod-openapi";

export const ForgotPasswordBodySchema = z.object({
	email: z.email("Formato de e-mail inválido"),
});

export const ForgotPasswordResponseSchema = z.object({
	message: z.string(),
});
