import { ResetPasswordRoute } from "./resetPassword.docs";
import { resetPassword } from "./resetPassword.service";

export const registerRoutesResetPassword = (server: ServerType) => {
	server.openapi(ResetPasswordRoute, async (ctx) => {
		const { token, password } = ctx.req.valid("json");
		await resetPassword(token, password);
		return ctx.json({ message: "Senha redefinida com sucesso." }, 200);
	});
};
