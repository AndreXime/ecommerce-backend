import { z } from "@hono/zod-openapi";

export const ResetPasswordBodySchema = z.object({
	token: z.string().min(1),
	password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export const ResetPasswordResponseSchema = z.object({
	message: z.string(),
});
