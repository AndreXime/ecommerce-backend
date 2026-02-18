import { CardAddRoute } from "./add.docs";
import { addCard } from "./add.service";

export const registerRoutesCardAdd = (server: ServerType) => {
	server.openapi(CardAddRoute, async (ctx) => {
		const { id } = ctx.get("user");
		const body = ctx.req.valid("json");
		const card = await addCard(id, body);
		return ctx.json(card, 201);
	});
};
