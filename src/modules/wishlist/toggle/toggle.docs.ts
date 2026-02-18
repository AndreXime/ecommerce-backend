import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { WishlistToggleParamSchema, WishlistToggleResponseSchema } from "./toggle.schema";

export const WishlistToggleRoute = createRoute({
	method: "post",
	path: "/:productId",
	tags: ["Wishlist"],
	summary: "Toggle produto na wishlist",
	description: "Adiciona o produto à wishlist se não estiver, remove se já estiver.",
	security: [{ Bearer: [] }],
	middleware: [auth([])],
	request: {
		params: WishlistToggleParamSchema,
	},
	responses: {
		200: {
			description: "Estado da wishlist atualizado",
			content: { "application/json": { schema: WishlistToggleResponseSchema } },
		},
		401: { description: "Não autenticado" },
	},
});
