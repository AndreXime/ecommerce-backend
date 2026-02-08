import { z } from "zod";
import type { Prisma } from "@/database/client/client";

// Definição dos parâmetros básicos que todo mundo tem
const basePagination = {
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(50).default(10),
	search: z.string().optional(),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
};

/**
 * Cria um schema de paginação customizado restringindo o sortBy
 */
export function createPaginationSchema<T extends string>(sortableFields: [T, ...T[]]) {
	return z.object({
		...basePagination,
		sortBy: z.enum(sortableFields).default(sortableFields[0]),
	});
}

/**
 * Converte os dados validados em argumentos do Prisma
 */
export function getPaginationArgs<T extends string, K extends string>(
	query: {
		page: number;
		limit: number;
		sortBy: T;
		sortOrder: "asc" | "desc";
		search?: string;
	},
	searchableFields: K[] = [], // K agora é um genérico restrito
) {
	const { page, limit, sortBy, sortOrder, search } = query;

	return {
		skip: (page - 1) * limit,
		take: limit,
		orderBy: {
			[sortBy]: sortOrder,
		} as Record<T, "asc" | "desc">,
		where:
			search && searchableFields.length > 0
				? {
						OR: searchableFields.map(
							(field) =>
								({
									[field]: { contains: search, mode: "insensitive" },
								}) as Record<K, { contains: string; mode: Prisma.QueryMode }>,
						),
					}
				: {},
	};
}
