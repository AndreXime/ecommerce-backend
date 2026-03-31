import type { z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { database } from "@/database/database";
import type { AddressUpdateBodySchema } from "./update.schema";

type Body = z.infer<typeof AddressUpdateBodySchema>;

export async function updateAddress(userId: string, addressId: string, body: Body) {
	return database.$transaction(async (tx) => {
		const address = await tx.address.findFirst({
			where: { id: addressId, userId },
		});

		if (!address) {
			throw new HTTPException(404, { message: "Endereço não encontrado." });
		}

		if (body.isDefault) {
			await tx.address.updateMany({
				where: { userId, isDefault: true, id: { not: addressId } },
				data: { isDefault: false },
			});
		}

		return tx.address.update({
			where: { id: addressId, userId },
			data: body,
		});
	});
}
