import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { OrderSchema } from "@/modules/shared/schemas/order";
import { OrderUpdateStatusBodySchema, OrderUpdateStatusParamSchema } from "./updateStatus.schema";

export const OrderUpdateStatusRoute = createRoute({
	method: "patch",
	path: "/:id/status",
	tags: ["Orders"],
	summary: "Atualizar status do pedido",
	security: [{ Bearer: [] }],
	middleware: [auth(["ADMIN"])],
	request: {
		params: OrderUpdateStatusParamSchema,
		body: { content: { "application/json": { schema: OrderUpdateStatusBodySchema } } },
	},
	responses: {
		200: {
			description: "Status atualizado",
			content: { "application/json": { schema: OrderSchema } },
		},
		401: { description: "Não autenticado" },
		403: { description: "Acesso negado (Requer ADMIN)" },
		404: { description: "Pedido não encontrado" },
	},
});
