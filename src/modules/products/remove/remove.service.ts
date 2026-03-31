import { database } from "@/database/database";
import storage from "@/lib/storage";

export async function removeProduct(id: string) {
	const product = await database.product.findUniqueOrThrow({
		where: { id },
		include: { images: true },
	});

	const imageKeys = product.images.flatMap((image) => (image.key ? [image.key] : []));

	await database.product.delete({ where: { id } });

	await Promise.allSettled(imageKeys.map((imageKey) => storage.deleteFile(imageKey)));
}
