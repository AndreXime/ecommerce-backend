import type { MiddlewareHandler } from "hono";
import { cors as Cors } from "hono/cors";
import type { AppBindings } from "@/@types/declarations";
import environment from "@/lib/environment";

const cors: MiddlewareHandler<AppBindings> = Cors({
	origin: [environment.FRONTEND_URL, environment.S3_ENDPOINT_URL],
	allowMethods: ["POST", "PUT", "GET", "DELETE"],
	credentials: true,
});

export default cors;
