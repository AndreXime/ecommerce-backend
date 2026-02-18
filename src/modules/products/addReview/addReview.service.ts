import type { z } from "@hono/zod-openapi";
import { database } from "@/database/database";
import type { AddReviewBodySchema } from "./addReview.schema";

type Body = z.infer<typeof AddReviewBodySchema>;

export async function addReview(productId: string, userId: string, body: Body) {
	const user = await database.user.findUniqueOrThrow({
		where: { id: userId },
		select: { name: true },
	});

	const initials = user.name
		.split(" ")
		.slice(0, 2)
		.map((w) => w[0].toUpperCase())
		.join("");

	const review = await database.$transaction(async (tx) => {
		const newReview = await tx.review.create({
			data: {
				productId,
				userId,
				author: user.name,
				initials,
				...body,
			},
		});

		// Recalcula rating e reviewsCount no produto
		const agg = await tx.review.aggregate({
			where: { productId },
			_avg: { rating: true },
			_count: { id: true },
		});

		await tx.product.update({
			where: { id: productId },
			data: {
				rating: agg._avg.rating ?? 0,
				reviewsCount: agg._count.id,
			},
		});

		return newReview;
	});

	return {
		id: review.id,
		author: review.author,
		avatar: review.avatar,
		initials: review.initials,
		rating: review.rating,
		date: review.date.toISOString(),
		title: review.title,
		content: review.content,
	};
}
