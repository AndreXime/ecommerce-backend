import { AddressAddRoute } from "./add.docs";
import { addAddress } from "./add.service";

export const registerRoutesAddressAdd = (server: ServerType) => {
	server.openapi(AddressAddRoute, async (ctx) => {
		const { id } = ctx.get("user");
		const body = ctx.req.valid("json");
		const address = await addAddress(id, body);
		return ctx.json(address, 201);
	});
};
