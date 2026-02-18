import { ReadUserRoute } from "./readUser.docs";
import { getAllUsers } from "./readUser.service";

export const registerRoutesReadUser = (server: ServerType) => {
	server.openapi(ReadUserRoute, async (ctx) => {
		const query = ctx.req.valid("query");

		const result = await getAllUsers(query);

		return ctx.json(result, 200);
	});
};
