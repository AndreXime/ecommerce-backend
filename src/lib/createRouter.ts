import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppBindings } from "@/@types/declarations";
import { zodHook } from "@/middlewares/validator";

export default function createRouter() {
	const app = new OpenAPIHono<AppBindings>({
		defaultHook: zodHook,
	});

	return app;
}
