import { CategoryListRoute } from "./list.docs";
import { listCategories } from "./list.service";

export const registerRoutesCategoryList = (server: ServerType) => {
	server.openapi(CategoryListRoute, async (ctx) => {
		const categories = await listCategories();
		return ctx.json(categories, 200);
	});
};
