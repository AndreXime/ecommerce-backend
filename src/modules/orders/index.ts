import createRouter from "@/lib/createRouter";
import { registerRoutesOrderCreate } from "./create/create.controller";
import { registerRoutesOrderGet } from "./get/get.controller";
import { registerRoutesOrderList } from "./list/list.controller";
import { registerRoutesOrderUpdateStatus } from "./updateStatus/updateStatus.controller";

export const createOrdersRoutes = () => {
	const app = createRouter();

	registerRoutesOrderList(app);
	registerRoutesOrderGet(app);
	registerRoutesOrderCreate(app);
	registerRoutesOrderUpdateStatus(app);

	return app;
};
