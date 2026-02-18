import { MeRoute } from "./me.docs";
import { getUserProfile } from "./me.service";

export const registerRoutesMe = (server: ServerType) => {
	server.openapi(MeRoute, async (ctx) => {
		const { id } = ctx.get("user");
		const profile = await getUserProfile(id);

		if (!profile) return ctx.json({ message: "Usuário não encontrado" }, 404);

		return ctx.json(profile, 200);
	});
};
