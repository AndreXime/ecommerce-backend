import { z } from "@hono/zod-openapi";
import { PublicUserSchema, UserSchema } from "@/modules/shared/schemas/user";

export const UpdateRequestSchema = z
	.object({
		id: UserSchema.shape.id,
		name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres").optional().openapi({
			description: "Novo nome do usuário",
			example: "André Ximenes",
		}),
		currentPassword: z.string().min(6).optional().openapi({
			description: "Senha atual (obrigatória para trocar a senha)",
			example: "senha_atual",
			format: "password",
		}),
		newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres").optional().openapi({
			description: "Nova senha desejada",
			example: "nova_senha",
			format: "password",
		}),
	})
	.refine(
		(data) => !!data.currentPassword === !!data.newPassword,
		"Para alterar a senha, informe a senha atual e a nova senha.",
	)
	.refine((data) => data.name || data.currentPassword, {
		message: "Informe ao menos um campo para atualizar.",
	});

export const UpdateResponseSchema = PublicUserSchema;

export type UpdateRequest = z.infer<typeof UpdateRequestSchema>;
