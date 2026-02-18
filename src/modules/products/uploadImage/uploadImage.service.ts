import { randomUUID } from "node:crypto";
import type { z } from "@hono/zod-openapi";
import { database } from "@/database/database";
import storage from "@/lib/storage";
import type { UploadImageBodySchema } from "./uploadImage.schema";

type Body = z.infer<typeof UploadImageBodySchema>;

export async function generateProductImageUpload(productId: string, body: Body) {
	await database.product.findUniqueOrThrow({ where: { id: productId } });

	const ext = body.contentType.split("/")[1];
	const date = new Date().toISOString().slice(0, 19).replace("T", "-").replace(/:/g, "-");
	const fileKey = `products/${productId}/${date}-${randomUUID()}.${ext}`;
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
		storage.getUploadUrl({ fileType: body.contentType, fileKey, cacheControl: "public, max-age=31536000, immutable" }),
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
