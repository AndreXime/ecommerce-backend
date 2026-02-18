import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { OrderSchema } from "@/modules/shared/schemas/order";
import { OrderCreateBodySchema } from "./create.schema";

export const OrderCreateRoute = createRoute({
	method: "post",
	path: "/",
	tags: ["Orders"],
	summary: "Criar pedido",
	description: "Cria pedido a partir do carrinho ativo ou de itens explícitos.",
	security: [{ Bearer: [] }],
	middleware: [auth([])],
	request: {
		body: { content: { "application/json": { schema: OrderCreateBodySchema } } },
	},
	responses: {
		201: {
			description: "Pedido criado",
			content: { "application/json": { schema: OrderSchema } },
		},
		400: { description: "Carrinho vazio" },
		401: { description: "Não autenticado" },
	},
});
