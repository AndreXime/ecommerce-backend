import { UploadImageRoute } from "./uploadImage.docs";
import { generateProductImageUpload } from "./uploadImage.service";

export const registerRoutesProductUploadImage = (server: ServerType) => {
	server.openapi(UploadImageRoute, async (ctx) => {
		const { id } = ctx.req.valid("param");
		const body = ctx.req.valid("json");
		const result = await generateProductImageUpload(id, body);
		return ctx.json(result, 201);
	});
};
