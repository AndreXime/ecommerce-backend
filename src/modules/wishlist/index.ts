import createRouter from "@/lib/createRouter";
import { registerRoutesWishlistToggle } from "./toggle/toggle.controller";

export const createWishlistRoutes = () => {
	const app = createRouter();

	registerRoutesWishlistToggle(app);

	return app;
};
