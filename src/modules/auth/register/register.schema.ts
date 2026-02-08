import { z } from "@hono/zod-openapi"; // Importar do pacote OpenAPI
import { SchemaEmail, SchemaName, SchemaPassword } from "@/modules/shared/schemas/user";

export const RegisterUserSchema = z
	.object({
		name: z.string({ error: "Nome completo é obrigatório." }).pipe(SchemaName).openapi({ example: "André Ximenes" }),
		email: z.string({ error: "E-mail é obrigatório." }).pipe(SchemaEmail).openapi({ example: "novo@usuario.com" }),
		password: z.string({ error: "Senha é obrigatória." }).pipe(SchemaPassword).openapi({ example: "senhaForte123" }),
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

export type RegisterUserSchema = z.infer<typeof RegisterUserSchema>;
