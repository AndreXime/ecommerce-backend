import { z } from "@hono/zod-openapi";

export const ProductImageSchema = z.object({
	id: z.string().uuid(),
	url: z.string().url(),
	position: z.number().int(),
});

export const SelectableOptionSchema = z.object({
	id: z.string().uuid(),
	label: z.string(),
	uiType: z.enum(["color", "pill", "select"]),
	values: z.array(z.string()),
});

export const ReviewSchema = z.object({
	id: z.string().uuid(),
	author: z.string(),
	avatar: z.string().nullable().optional(),
	initials: z.string().nullable().optional(),
	rating: z.number().int().min(1).max(5),
	date: z.iso.datetime(),
	title: z.string(),
	content: z.string(),
});

export const CategorySchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
});

export const ProductSummarySchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	tag: z.string(),
	price: z.number(),
	category: z.string(),
	discountPercentage: z.number().nullable().optional(),
	images: z.array(z.string()),
	rating: z.number(),
	reviewsCount: z.number().int(),
	isNew: z.boolean(),
	inStock: z.boolean(),
});

export const ProductDetailsSchema = ProductSummarySchema.extend({
	quantitySold: z.number().int(),
	description: z.string(),
	specs: z.record(z.string(), z.string()),
	images: z.array(ProductImageSchema),
	options: z.array(SelectableOptionSchema).optional(),
	fullReviews: z.array(ReviewSchema).optional(),
});
