import { z } from "@hono/zod-openapi";

export const UserSchema = z.object({
	id: z.uuid("ID inválido").openapi({
		description: "ID único do usuário (UUID)",
		example: "123e4567-e89b-12d3-a456-426614174000",
	}),

	name: z.string("O nome é obrigatório").min(3, "O nome deve ter pelo menos 3 caracteres").openapi({
		description: "Nome completo do usuário",
		example: "André Ximenes",
	}),

	email: z.email("Formato de e-mail inválido").openapi({
		description: "Endereço de e-mail principal",
		example: "andre@exemplo.com",
	}),

	password: z.string("A senha é obrigatória").min(6, "A senha deve ter no mínimo 6 caracteres").openapi({
		description: "Senha de acesso (mínimo 6 caracteres)",
		example: "******",
		format: "password",
	}),

	role: z.enum(["ADMIN", "CUSTOMER", "SUPPORT"], "Nível de acesso inválido.").openapi({
		description: "Papel do usuário no sistema",
		example: "CUSTOMER",
	}),

	createdAt: z.iso
		.datetime("Data de criação invalida")
		.openapi({ description: "Data de criação do usuário no sistema", example: "2026-02-01T10:00:00Z" }),
	updatedAt: z.iso.datetime("Data de invalida invalida").openapi({
		description: "Ultima data que algum dado do usuario foi atualizado no sistema",
		example: "2026-02-05T15:30:00Z",
	}),
});

export const PublicUserSchema = UserSchema.omit({ password: true });
