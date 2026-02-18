import { z } from "@hono/zod-openapi";

export const LogoutResponseSchema = z.object({
	message: z.string().openapi({ example: "Logout com sucesso" }),
});
