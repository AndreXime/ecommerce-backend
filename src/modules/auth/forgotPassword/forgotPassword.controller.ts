import { ForgotPasswordRoute } from "./forgotPassword.docs";
import { requestPasswordReset } from "./forgotPassword.service";

export const registerRoutesForgotPassword = (server: ServerType) => {
	server.openapi(ForgotPasswordRoute, async (ctx) => {
		const { email } = ctx.req.valid("json");
		await requestPasswordReset(email);
		return ctx.json({ message: "Se este email estiver cadastrado, você receberá as instruções em breve." }, 200);
	});
};
