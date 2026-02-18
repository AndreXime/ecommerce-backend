import type { Prisma } from "@/database/client/client";

type ProductWithRelations = Prisma.ProductGetPayload<{
	include: {
		category: true;
		images: true;
		options: true;
		reviews: true;
	};
}>;

type ProductSummaryPayload = Prisma.ProductGetPayload<{
	include: { category: true; images: true };
}>;

export function toProductSummary(p: ProductSummaryPayload) {
	return {
		id: p.id,
		name: p.name,
		tag: p.tag,
		price: Number(p.price),
		category: p.category.name,
		discountPercentage: p.discountPercentage ? Number(p.discountPercentage) : null,
		images: p.images.sort((a, b) => a.position - b.position).map((img) => img.url),
		rating: Number(p.rating),
		reviewsCount: p.reviewsCount,
		isNew: p.isNew,
		inStock: p.inStock,
	};
}

export function toProductDetails(p: ProductWithRelations) {
	return {
		...toProductSummary(p),
		quantitySold: p.quantitySold,
		description: p.description,
		specs: p.specs as Record<string, string>,
		options: p.options?.map((opt) => ({
			id: opt.id,
			label: opt.label,
			uiType: opt.uiType as "color" | "pill" | "select",
			values: opt.values,
		})),
		fullReviews: p.reviews?.map((r) => ({
			id: r.id,
			author: r.author,
			avatar: r.avatar,
			initials: r.initials,
			rating: r.rating,
			date: r.date.toISOString(),
			title: r.title,
			content: r.content,
		})),
	};
}
