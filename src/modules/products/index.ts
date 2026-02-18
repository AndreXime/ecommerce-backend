import createRouter from "@/lib/createRouter";
import { registerRoutesProductAddReview } from "./addReview/addReview.controller";
import { registerRoutesProductCreate } from "./create/create.controller";
import { registerRoutesProductGet } from "./get/get.controller";
import { registerRoutesProductList } from "./list/list.controller";
import { registerRoutesProductRemove } from "./remove/remove.controller";
import { registerRoutesProductUpdate } from "./update/update.controller";

export const createProductsRoutes = () => {
	const app = createRouter();

	registerRoutesProductList(app);
	registerRoutesProductGet(app);
	registerRoutesProductCreate(app);
	registerRoutesProductUpdate(app);
	registerRoutesProductRemove(app);
	registerRoutesProductAddReview(app);

	return app;
};
