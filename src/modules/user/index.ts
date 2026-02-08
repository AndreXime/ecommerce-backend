import createRouter from "@/lib/createRouter";
import { registerRoutesMe } from "../user/me/me.controller";
import { registerRoutesReadUser } from "./readUser/readUser.controller";

export const createRoutesUser = () => {
	const app = createRouter();

	registerRoutesReadUser(app);
	registerRoutesMe(app);

	return app;
};
