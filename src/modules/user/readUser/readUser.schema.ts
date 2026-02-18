import { z } from "@hono/zod-openapi";
import { PaginationMetaSchema } from "@/modules/shared/schemas/pagination";
import { UserSchema } from "@/modules/shared/schemas/user";
import { createPaginationSchema } from "@/modules/shared/utils/generatePaginationQuery";

export const ReadUserRequestQuerySchema = createPaginationSchema(["name", "email", "createdAt"]);

export const ReadUserResponseSchema = z.object({
	data: z.array(UserSchema.omit({ password: true })),
	meta: PaginationMetaSchema,
});

export type ReadUserResponse = z.infer<typeof ReadUserResponseSchema>;
export type ReadUserRequestQuery = z.infer<typeof ReadUserRequestQuerySchema>;
