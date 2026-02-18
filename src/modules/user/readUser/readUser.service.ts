import { database } from "@/database/database";
import { getPaginationArgs } from "@/modules/shared/utils/generatePaginationQuery";
import type { ReadUserRequestQuery } from "./readUser.schema";

export async function getAllUsers(query: ReadUserRequestQuery) {
	const args = getPaginationArgs(query, ["name", "email"]);

	const [users, total] = await Promise.all([
		database.user.findMany({
			...args,
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				createdAt: true,
				updatedAt: true,
			},
		}),
		database.user.count({ where: args.where }),
	]);

	const totalPages = Math.ceil(total / query.limit);

	return {
		data: users.map((u) => ({
			...u,
			createdAt: u.createdAt.toISOString(),
			updatedAt: u.updatedAt.toISOString(),
		})),
		meta: {
			page: query.page,
			limit: query.limit,
			total,
			totalPages,
		},
	};
}
