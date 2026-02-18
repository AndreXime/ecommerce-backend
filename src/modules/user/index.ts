import createRouter from "@/lib/createRouter";
import { registerRoutesMe } from "../user/me/me.controller";
import { registerRoutesReadUser } from "./readUser/readUser.controller";
import { registerRoutesUpdate } from "./update/update.controller";

export const createRoutesUser = () => {
	const app = createRouter();

	registerRoutesReadUser(app);
	registerRoutesMe(app);
	registerRoutesUpdate(app);

	return app;
};
