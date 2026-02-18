import { z } from "@hono/zod-openapi";
import { UserSchema } from "@/modules/shared/schemas/user";

export const RegisterRequestSchema = UserSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
})
	.extend({
		confirmPassword: z
			.string({ error: "Confirmação de senha é obrigatória." })
			.min(6, { error: "A confirmação de senha deve ter no mínimo 6 caracteres." })
			.openapi({ example: "senhaForte123" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas não coincidem.",
		path: ["confirmPassword"],
	});

export const RegisterResponseSchema = z.object({
	message: z.string().openapi({ example: "Cadastro enviado com sucesso" }),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
