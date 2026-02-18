import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { ProductDetailsSchema } from "@/modules/shared/schemas/product";
import { ProductUpdateBodySchema, ProductUpdateParamSchema } from "./update.schema";

export const ProductUpdateRoute = createRoute({
	method: "patch",
	path: "/:id",
	tags: ["Products"],
	summary: "Atualizar produto",
	security: [{ Bearer: [] }],
	middleware: [auth(["ADMIN"])],
	request: {
		params: ProductUpdateParamSchema,
		body: { content: { "application/json": { schema: ProductUpdateBodySchema } } },
	},
	responses: {
		200: {
			description: "Produto atualizado",
			content: { "application/json": { schema: ProductDetailsSchema } },
		},
		401: { description: "Não autenticado" },
		403: { description: "Acesso negado (Requer ADMIN)" },
		404: { description: "Produto não encontrado" },
	},
});
