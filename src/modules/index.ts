import { createAuthRoutes } from "./auth";
import { createHealthRoutes } from "./health";
import { createRoutesUser } from "./user";

const registerRoutes = (server: ServerType) => {
	server.route("/health", createHealthRoutes());
	server.route("/auth", createAuthRoutes());
	server.route("/users", createRoutesUser());
};

export { registerRoutes };
