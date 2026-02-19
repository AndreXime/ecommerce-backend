import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { CartSchema } from "@/modules/shared/schemas/cart";

export const CartGetRoute = createRoute({
	method: "get",
	path: "/",
	tags: ["Cart"],
	summary: "Obter carrinho",
	description:
		"Retorna o carrinho ativo do usuário com todos os itens, quantidades, variantes selecionadas e totais calculados.",
	security: [{ Bearer: [] }],
	middleware: [auth([])],
	responses: {
		200: {
			description: "Carrinho do usuário",
			content: { "application/json": { schema: CartSchema } },
		},
		401: { description: "Não autenticado" },
	},
});
