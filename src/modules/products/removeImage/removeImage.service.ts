import { database } from "@/database/database";
import storage from "@/lib/storage";

export async function removeProductImage(productId: string, imageId: string) {
	const image = await database.productImage.findFirst({
		where: { id: imageId, productId },
	});

	if (!image) return false;

	// Remove do banco primeiro; se o delete S3 falhar o registro já foi limpo
	await database.productImage.delete({ where: { id: imageId } });

	if (image.key) {
		await storage.deleteFile(image.key);
	}

	return true;
}
