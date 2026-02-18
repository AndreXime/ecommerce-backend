import { database } from "@/database/database";

export async function createCategory(name: string) {
	return database.category.create({ data: { name } });
}
