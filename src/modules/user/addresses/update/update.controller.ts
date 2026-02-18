import { AddressUpdateRoute } from "./update.docs";
import { updateAddress } from "./update.service";

export const registerRoutesAddressUpdate = (server: ServerType) => {
	server.openapi(AddressUpdateRoute, async (ctx) => {
		const { id: userId } = ctx.get("user");
		const { addressId } = ctx.req.valid("param");
		const body = ctx.req.valid("json");
		const address = await updateAddress(userId, addressId, body);
		return ctx.json(address, 200);
	});
};
