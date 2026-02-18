import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { UpdateRequestSchema, UpdateResponseSchema } from "./update.schema";

export const UpdateRoute = createRoute({
	method: "put",
	path: "/",
	tags: ["User"],
	summary: "Atualizar usuário",
	description: "Atualiza nome e/ou senha de um usuário. Não-admins só podem alterar o próprio cadastro.",
	security: [{ Bearer: [] }],
	middleware: [auth([])],
	request: {
		body: {
			content: { "application/json": { schema: UpdateRequestSchema } },
			required: true,
		},
	},
	responses: {
		200: {
			description: "Usuário atualizado com sucesso",
			content: { "application/json": { schema: UpdateResponseSchema } },
		},
		401: { description: "Não autorizado ou senha atual incorreta" },
		403: { description: "Sem permissão para alterar este usuário" },
		404: { description: "Usuário não encontrado" },
		422: { description: "Dados inválidos" },
	},
});
