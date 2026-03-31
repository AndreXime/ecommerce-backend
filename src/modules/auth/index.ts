import createRouter from "@/lib/createRouter";
import environment from "@/lib/environment";
import rateLimiter from "@/middlewares/rate-limiter";
import { registerRoutesForgotPassword } from "./forgotPassword/forgotPassword.controller";
import { registerRoutesSignIn } from "./login/login.controller";
import { registerRoutesLogout } from "./logout/logout.controller";
import { registerRoutesRefresh } from "./refresh/refresh.controller";
import { registerRoutesSignUp } from "./register/register.controller";
import { registerRoutesResetPassword } from "./resetPassword/resetPassword.controller";

export const createAuthRoutes = () => {
	const app = createRouter();
	const authRateLimit = environment.ENV === "TEST" ? 100 : 10;

	// Em testes aumentamos o teto para evitar interferência entre casos da suíte.
	// Isto impede brute-force no login e criação de contas em massa.
	app.use(rateLimiter(authRateLimit, 15, "auth_strict"));

	registerRoutesSignIn(app);
	registerRoutesSignUp(app);
	registerRoutesLogout(app);
	registerRoutesRefresh(app);
	registerRoutesForgotPassword(app);
	registerRoutesResetPassword(app);

	return app;
};
