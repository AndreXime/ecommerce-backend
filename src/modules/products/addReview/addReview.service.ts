import type { z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { Prisma } from "prisma";
import { database } from "@/database/database";
import type { AddReviewBodySchema } from "./addReview.schema";

type Body = z.infer<typeof AddReviewBodySchema>;

export async function addReview(productId: string, userId: string, body: Body) {
	const [product, user, eligibleDeliveredOrderItem, existingReview] = await Promise.all([
		database.product.findUnique({
			where: { id: productId },
			select: { id: true },
		}),
		database.user.findUniqueOrThrow({
			where: { id: userId },
			select: { name: true },
		}),
		database.orderItem.findFirst({
			where: {
				productId,
				order: {
					userId,
					status: "delivered",
				},
			},
			select: { id: true },
		}),
		database.review.findFirst({
			where: {
				productId,
				userId,
			},
			select: { id: true },
		}),
	]);

	if (!product) {
		throw new HTTPException(404, { message: "Produto não encontrado." });
	}

	if (!eligibleDeliveredOrderItem) {
		throw new HTTPException(403, {
			message: "Apenas clientes com pedido entregue deste produto podem avaliá-lo.",
		});
	}

	if (existingReview) {
		throw new HTTPException(409, {
			message: "Você já avaliou este produto.",
		});
	}

	const initials = user.name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((word) => word[0]?.toUpperCase() ?? "")
		.filter(Boolean)
		.join("");

	try {
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
	} catch (error: unknown) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
			throw new HTTPException(409, {
				message: "Você já avaliou este produto.",
			});
		}

		throw error;
	}
}
