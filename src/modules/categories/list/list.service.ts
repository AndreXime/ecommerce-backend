import { database } from "@/database/database";

export async function listCategories() {
	return database.category.findMany({ orderBy: { name: "asc" } });
}
