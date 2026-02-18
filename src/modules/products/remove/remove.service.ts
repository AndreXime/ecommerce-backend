import { database } from "@/database/database";

export async function removeProduct(id: string) {
	await database.product.delete({ where: { id } });
}
