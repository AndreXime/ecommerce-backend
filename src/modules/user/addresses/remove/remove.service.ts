import { database } from "@/database/database";

export async function removeAddress(userId: string, addressId: string) {
	await database.address.delete({ where: { id: addressId, userId } });
}
