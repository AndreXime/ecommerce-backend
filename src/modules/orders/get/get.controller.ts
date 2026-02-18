import { OrderGetRoute } from "./get.docs";
import { getOrder } from "./get.service";

export const registerRoutesOrderGet = (server: ServerType) => {
	server.openapi(OrderGetRoute, async (ctx) => {
		const { id: userId, role } = ctx.get("user");
		const { id: orderId } = ctx.req.valid("param");
		const order = await getOrder(orderId, userId, role === "ADMIN");

		if (!order) return ctx.json({ message: "Pedido não encontrado" }, 404);

		return ctx.json(order, 200);
	});
};
