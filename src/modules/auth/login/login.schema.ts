import { z } from "@hono/zod-openapi";
import { SchemaEmail, SchemaPassword } from "@/modules/shared/schemas/user";

export const SchemaSignIn = z.object({
	email: SchemaEmail,
	password: SchemaPassword,
});

export const SchemaSignInResponse = z.object({
	message: z.string().openapi({ example: "Login com sucesso [LOG]" }),
});

export type UserSignIn = z.infer<typeof SchemaSignIn>;
