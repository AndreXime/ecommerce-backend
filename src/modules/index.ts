import { createAuthRoutes } from "./auth";
import { createRoutesUser } from "./user";

const registerRoutes = (server: ServerType) => {
	server.route("/auth", createAuthRoutes());
	server.route("/users", createRoutesUser());
};

export { registerRoutes };
