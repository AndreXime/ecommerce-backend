import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { ProductDetailsSchema } from "@/modules/shared/schemas/product";
import { ProductCreateBodySchema } from "./create.schema";

export const ProductCreateRoute = createRoute({
	method: "post",
	path: "/",
	tags: ["Products"],
	summary: "Criar produto",
	description: "Cria um novo produto no catálogo. Imagens devem ser enviadas separadamente via POST /:id/images.",
	security: [{ Bearer: [] }],
	middleware: [auth(["ADMIN"])],
	request: {
		body: { content: { "application/json": { schema: ProductCreateBodySchema } } },
	},
	responses: {
		201: {
			description: "Produto criado",
			content: { "application/json": { schema: ProductDetailsSchema } },
		},
		401: { description: "Não autenticado" },
		403: { description: "Acesso negado (Requer ADMIN)" },
	},
});
