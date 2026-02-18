import { HTTPException } from "hono/http-exception";
import type { JWT } from "@/@types/declarations";
import { database } from "@/database/database";
import { hashPassword, verifyPassword } from "@/modules/auth/shared/hash";
import type { UpdateRequest } from "./update.schema";

export async function updateUser(currentUser: JWT, data: UpdateRequest) {
	if (currentUser.role !== "ADMIN" && currentUser.id !== data.id) {
		throw new HTTPException(403, { message: "Sem permissão para alterar este usuário." });
	}

	const user = await database.user.findUnique({
		where: { id: data.id },
		select: { id: true, password: true },
	});

	if (!user) {
		throw new HTTPException(404, { message: "Usuário não encontrado." });
	}

	const payload: { name?: string; password?: string } = {};

	if (data.name) {
		payload.name = data.name;
	}

	if (data.currentPassword && data.newPassword) {
		const isValid = await verifyPassword(data.currentPassword, user.password);
		if (!isValid) {
			throw new HTTPException(401, { message: "Senha atual incorreta." });
		}
		payload.password = await hashPassword(data.newPassword);
	}

	return database.user.update({
		where: { id: data.id },
		data: payload,
		omit: { password: true },
	});
}
