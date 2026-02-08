import { database } from "@/database/database";

export async function getUserById(userId: string) {
	const user = await database.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			email: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	return user;
}
