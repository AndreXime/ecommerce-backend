import { MeRoute } from "./me.docs";
import { getUserById } from "./me.service";

export const registerRoutesMe = (server: ServerType) => {
	server.openapi(MeRoute, async (ctx) => {
		const currentUser = ctx.get("user");
		const user = await getUserById(currentUser.id);

		if (!user) {
			return ctx.json({ message: "Usuário não encontrado" }, 404);
		}

		return ctx.json(user, 200);
	});
};
