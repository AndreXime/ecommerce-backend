import { AddReviewRoute } from "./addReview.docs";
import { addReview } from "./addReview.service";

export const registerRoutesProductAddReview = (server: ServerType) => {
	server.openapi(AddReviewRoute, async (ctx) => {
		const { id: userId } = ctx.get("user");
		const { id: productId } = ctx.req.valid("param");
		const body = ctx.req.valid("json");
		const review = await addReview(productId, userId, body);
		return ctx.json(review, 201);
	});
};
