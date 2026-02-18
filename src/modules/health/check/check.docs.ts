import { createRoute } from "@hono/zod-openapi";
import { CheckResponseSchema } from "./check.schema";

export const CheckRoute = createRoute({
	method: "get",
	path: "/check",
	tags: ["System"],
	summary: "Health check",
	description: "Verifica a disponibilidade dos serviços dependentes.",
	responses: {
		200: {
			description: "Todos os serviços estão operacionais",
			content: { "application/json": { schema: CheckResponseSchema } },
		},
		503: {
			description: "Um ou mais serviços estão indisponíveis",
			content: { "application/json": { schema: CheckResponseSchema } },
		},
	},
});
