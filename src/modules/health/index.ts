import createRouter from "@/lib/createRouter";
import { registerRoutesCheck } from "./check/check.controller";

export const createHealthRoutes = () => {
	const app = createRouter();
	registerRoutesCheck(app);
	return app;
};
