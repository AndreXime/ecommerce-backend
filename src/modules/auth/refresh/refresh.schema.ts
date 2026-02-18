import { z } from "@hono/zod-openapi";

export const RefreshRequestSchema = z.object({
	refreshToken: z.string().openapi({ description: "Token de atualização" }),
});

export const RefreshResponseSchema = z.object({
	message: z.string().openapi({ example: "Sessão renovada com sucesso" }),
});
