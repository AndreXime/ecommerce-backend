import { UpdateRoute } from "./update.docs";
import { updateUser } from "./update.service";

export const registerRoutesUpdate = (server: ServerType) => {
	server.openapi(UpdateRoute, async (ctx) => {
		const currentUser = ctx.get("user");
		const body = ctx.req.valid("json");
		const user = await updateUser(currentUser, body);
		return ctx.json(user, 200);
	});
};
