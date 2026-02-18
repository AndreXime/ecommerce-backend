import { CategoryCreateRoute } from "./create.docs";
import { createCategory } from "./create.service";

export const registerRoutesCategoryCreate = (server: ServerType) => {
	server.openapi(CategoryCreateRoute, async (ctx) => {
		const { name } = ctx.req.valid("json");
		const category = await createCategory(name);
		return ctx.json(category, 201);
	});
};
