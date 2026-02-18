import { RemoveImageRoute } from "./removeImage.docs";
import { removeProductImage } from "./removeImage.service";

export const registerRoutesProductRemoveImage = (server: ServerType) => {
	server.openapi(RemoveImageRoute, async (ctx) => {
		const { id: productId, imageId } = ctx.req.valid("param");
		const removed = await removeProductImage(productId, imageId);

		if (!removed) return ctx.json({ message: "Imagem não encontrada" }, 404);

		return ctx.body(null, 204);
	});
};
