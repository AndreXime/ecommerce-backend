import createRouter from "@/lib/createRouter";
import { registerRoutesCategoryCreate } from "./create/create.controller";
import { registerRoutesCategoryList } from "./list/list.controller";

export const createCategoriesRoutes = () => {
	const app = createRouter();

	registerRoutesCategoryList(app);
	registerRoutesCategoryCreate(app);

	return app;
};
