import createRouter from "@/lib/createRouter";
import { registerRoutesAddressAdd } from "./addresses/add/add.controller";
import { registerRoutesAddressRemove } from "./addresses/remove/remove.controller";
import { registerRoutesAddressUpdate } from "./addresses/update/update.controller";
import { registerRoutesCardAdd } from "./cards/add/add.controller";
import { registerRoutesCardRemove } from "./cards/remove/remove.controller";
import { registerRoutesMe } from "./me/me.controller";
import { registerRoutesReadUser } from "./readUser/readUser.controller";
import { registerRoutesUpdate } from "./update/update.controller";

export const createRoutesUser = () => {
	const app = createRouter();

	registerRoutesReadUser(app);
	registerRoutesMe(app);
	registerRoutesUpdate(app);
	registerRoutesAddressAdd(app);
	registerRoutesAddressUpdate(app);
	registerRoutesAddressRemove(app);
	registerRoutesCardAdd(app);
	registerRoutesCardRemove(app);

	return app;
};
