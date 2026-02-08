import { OpenAPIHono } from "@hono/zod-openapi";
import { csrf } from "hono/csrf";
import { secureHeaders } from "hono/secure-headers";
import type { AppBindings } from "@/@types/declarations";
import { registerRoutes } from "@/modules";
import { PrismaDatabase } from "./database/database";
import { log, setupDocs, showRoutes } from "./lib/dev";
import environment from "./lib/environment";
import { setupEmailWorker } from "./lib/queue";
import redis from "./lib/redis";
import storage from "./lib/storage";
import cors from "./middlewares/cors";
import database from "./middlewares/database";
import errors from "./middlewares/errors";
import requestLogger from "./middlewares/logger";
import rateLimiter from "./middlewares/rate-limiter";

const server = new OpenAPIHono<AppBindings>();

if (environment.ENV === "DEV") {
	server.use(requestLogger);
}

server.use(secureHeaders());
server.use(cors);
server.use(database);
server.use(
	csrf({
		origin: [environment.FRONTEND_URL],
	}),
);

// 100 requisições a cada 15 minutos por IP
server.use(rateLimiter(100, 15, "global"));

server.onError(errors);
registerRoutes(server);

if (environment.ENV === "DEV") {
	showRoutes(server);
	setupDocs(server);
}

server.notFound((c) => c.json({ message: "Rota não econtrada" }, 404));

log(`Iniciando servidor no modo: ${environment.ENV}`, "info");
await storage.testConnection();
await PrismaDatabase.testConnection();
await redis.testConnection();
await setupEmailWorker();

export default server;
