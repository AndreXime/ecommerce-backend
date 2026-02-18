import { AddressRemoveRoute } from "./remove.docs";
import { removeAddress } from "./remove.service";

export const registerRoutesAddressRemove = (server: ServerType) => {
	server.openapi(AddressRemoveRoute, async (ctx) => {
		const { id: userId } = ctx.get("user");
		const { addressId } = ctx.req.valid("param");
		await removeAddress(userId, addressId);
		return ctx.body(null, 204);
	});
};
