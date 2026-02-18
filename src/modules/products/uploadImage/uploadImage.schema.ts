import { z } from "@hono/zod-openapi";

export const UploadImageParamSchema = z.object({
	id: z.string().uuid(),
});

export const UploadImageBodySchema = z.object({
	contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
	position: z.number().int().min(0).optional().default(0),
});

export const UploadImageResponseSchema = z.object({
	uploadUrl: z.string().url(),
	image: z.object({
		id: z.string().uuid(),
		url: z.string().url(),
		key: z.string(),
		position: z.number().int(),
	}),
});
