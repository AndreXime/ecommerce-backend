import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppBindings } from "@/@types/declarations";
import { zodHook } from "@/middlewares/validator";

export default function createRouter() {
	return new OpenAPIHono<AppBindings>({
		defaultHook: zodHook,
	});
}
