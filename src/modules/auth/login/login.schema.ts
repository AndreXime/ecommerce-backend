import { z } from "@hono/zod-openapi";
import { UserSchema } from "@/modules/shared/schemas/user";

export const LoginRequestSchema = UserSchema.pick({
	email: true,
	password: true,
});

export const LoginResponseSchema = z.object({
	message: z.string().openapi({ example: "Login com sucesso" }),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
