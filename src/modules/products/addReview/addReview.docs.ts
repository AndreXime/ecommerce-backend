import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { AddReviewBodySchema, AddReviewParamSchema, AddReviewResponseSchema } from "./addReview.schema";

export const AddReviewRoute = createRoute({
	method: "post",
	path: "/:id/reviews",
	tags: ["Products"],
	summary: "Avaliar produto",
	security: [{ Bearer: [] }],
	middleware: [auth([])],
	request: {
		params: AddReviewParamSchema,
		body: { content: { "application/json": { schema: AddReviewBodySchema } } },
	},
	responses: {
		201: {
			description: "Avaliação adicionada",
			content: { "application/json": { schema: AddReviewResponseSchema } },
		},
		401: { description: "Não autenticado" },
		404: { description: "Produto não encontrado" },
	},
});
