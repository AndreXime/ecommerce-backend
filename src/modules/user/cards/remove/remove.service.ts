import { database } from "@/database/database";

export async function removeCard(userId: string, cardId: string) {
	await database.paymentCard.delete({ where: { id: cardId, userId } });
}
