import { z } from "@hono/zod-openapi";

export const CheckResponseSchema = z.object({
	status: z.enum(["ok", "degraded"]).openapi({ example: "ok" }),
	services: z.object({
		database: z.enum(["up", "down"]).openapi({ example: "up" }),
		redis: z.enum(["up", "down"]).openapi({ example: "up" }),
	}),
});

export type CheckResponse = z.infer<typeof CheckResponseSchema>;
