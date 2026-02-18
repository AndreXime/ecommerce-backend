import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { CardAddBodySchema, CardAddResponseSchema } from "./add.schema";

export const CardAddRoute = createRoute({
	method: "post",
	path: "/me/cards",
	tags: ["User"],
	summary: "Adicionar cartão de pagamento",
	security: [{ Bearer: [] }],
	middleware: [auth([])],
	request: {
		body: { content: { "application/json": { schema: CardAddBodySchema } } },
	},
	responses: {
		201: {
			description: "Cartão adicionado",
			content: { "application/json": { schema: CardAddResponseSchema } },
		},
		401: { description: "Não autenticado" },
	},
});
