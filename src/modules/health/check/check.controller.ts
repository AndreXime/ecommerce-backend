import { CheckRoute } from "./check.docs";
import { checkDependencies } from "./check.service";

export const registerRoutesCheck = (server: ServerType) => {
	server.openapi(CheckRoute, async (ctx) => {
		const result = await checkDependencies();
		return ctx.json(result, result.status === "ok" ? 200 : 503);
	});
};
