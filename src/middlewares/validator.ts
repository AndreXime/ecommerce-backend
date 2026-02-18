import type { Hook } from "@hono/zod-openapi";
import type { AppBindings } from "@/@types/declarations";

// biome-ignore lint/suspicious/noExplicitAny: "Ele aceita qualquer objeto zod e a saida por ser qualquer coisa"
export const zodHook: Hook<any, AppBindings, any, any> = (result, c) => {
	if (!result.success) {
		const errorResponse = result.error.issues.map((issue) => ({
			param: issue.path.join("_"),
			message: issue.message,
		}));

		return c.json({ errors: errorResponse }, 400);
	}

	// Se success for true permite que a requisição siga.
};
