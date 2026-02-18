import { CardRemoveRoute } from "./remove.docs";
import { removeCard } from "./remove.service";

export const registerRoutesCardRemove = (server: ServerType) => {
	server.openapi(CardRemoveRoute, async (ctx) => {
		const { id: userId } = ctx.get("user");
		const { cardId } = ctx.req.valid("param");
		await removeCard(userId, cardId);
		return ctx.body(null, 204);
	});
};
