import { setAuthCookies } from "../shared/tokens";
import { LoginRoute } from "./login.docs";
import { signIn } from "./login.service";

const registerRoutesSignIn = (server: ServerType) =>
	server.openapi(LoginRoute, async (ctx) => {
		const { email, password } = ctx.req.valid("json");

		const { accessToken, refreshToken } = await signIn({ email, password });

		setAuthCookies(ctx, accessToken, refreshToken);

		return ctx.json({ message: "Login com sucesso" }, 200);
	});

export { registerRoutesSignIn };
