import { randomUUID } from "node:crypto";
import type { z } from "@hono/zod-openapi";
import { database } from "@/database/database";
import storage from "@/lib/storage";
import type { UploadImageBodySchema } from "./uploadImage.schema";

type Body = z.infer<typeof UploadImageBodySchema>;

export async function generateProductImageUpload(productId: string, body: Body) {
	await database.product.findUniqueOrThrow({ where: { id: productId } });

	const ext = body.contentType.split("/")[1];
	const fileKey = `products/${productId}/${randomUUID()}.${ext}`;
	const publicUrl = storage.getPublicUrl(fileKey);

	const [image, { uploadUrl }] = await Promise.all([
		database.productImage.create({
			data: {
				productId,
				key: fileKey,
				url: publicUrl,
				position: body.position,
			},
		}),
		storage.getUploadUrl(body.contentType, fileKey),
	]);

	return {
		uploadUrl,
		image: {
			id: image.id,
			url: image.url,
			key: fileKey,
			position: image.position,
		},
	};
}
