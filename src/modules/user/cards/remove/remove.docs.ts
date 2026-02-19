import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { CardRemoveParamSchema } from "./remove.schema";

export const CardRemoveRoute = createRoute({
	method: "delete",
	path: "/me/cards/:cardId",
	tags: ["User"],
	summary: "Remover cartão de pagamento",
	description: "Remove permanentemente um cartão de pagamento do perfil do usuário autenticado.",
	security: [{ Bearer: [] }],
	middleware: [auth([])],
	request: {
		params: CardRemoveParamSchema,
	},
	responses: {
		204: { description: "Cartão removido" },
		401: { description: "Não autenticado" },
		404: { description: "Cartão não encontrado" },
	},
});
