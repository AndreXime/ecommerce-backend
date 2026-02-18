import createRouter from "@/lib/createRouter";
import { registerRoutesCartAddItem } from "./addItem/addItem.controller";
import { registerRoutesCartGet } from "./get/get.controller";
import { registerRoutesCartRemoveItem } from "./removeItem/removeItem.controller";
import { registerRoutesCartUpdateItem } from "./updateItem/updateItem.controller";

export const createCartRoutes = () => {
	const app = createRouter();

	registerRoutesCartGet(app);
	registerRoutesCartAddItem(app);
	registerRoutesCartUpdateItem(app);
	registerRoutesCartRemoveItem(app);

	return app;
};
