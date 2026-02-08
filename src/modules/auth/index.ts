import createRouter from "@/lib/createRouter";
import rateLimiter from "@/middlewares/rate-limiter";
import { registerRoutesSignIn } from "./login/login.controller";
import { registerRoutesLogout } from "./logout/logout.controller";
import { registerRoutesRefresh } from "./refresh/refresh.controller";
import { registerRoutesSignUp } from "./register/register.controller";

export const createAuthRoutes = () => {
	const app = createRouter();

	// 10 tentativas a cada 15 minutos
	// Isto impede brute-force no login e criação de contas em massa.
	app.use(rateLimiter(10, 15, "auth_strict"));

	registerRoutesSignIn(app);
	registerRoutesSignUp(app);
	registerRoutesLogout(app);
	registerRoutesRefresh(app);

	return app;
};
