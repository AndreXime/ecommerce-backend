import type { z } from "@hono/zod-openapi";
import { database } from "@/database/database";
import type { AddressUpdateBodySchema } from "./update.schema";

type Body = z.infer<typeof AddressUpdateBodySchema>;

export async function updateAddress(userId: string, addressId: string, body: Body) {
	if (body.isDefault) {
		await database.address.updateMany({
			where: { userId, isDefault: true },
			data: { isDefault: false },
		});
	}

	return database.address.update({
		where: { id: addressId, userId },
		data: body,
	});
}
