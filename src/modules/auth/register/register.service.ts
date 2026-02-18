import { HTTPException } from "hono/http-exception";
import { database } from "@/database/database";
import { sendEmail } from "@/lib/queue";
import { hashPassword } from "@/modules/auth/shared/hash";
import { generateAuthTokens } from "../shared/tokens";
import type { RegisterRequest } from "./register.schema";

async function signUp(data: RegisterRequest) {
	const existingUser = await database.user.findUnique({
		where: { email: data.email },
		select: { id: true },
	});

	if (existingUser) {
		throw new HTTPException(409, { message: "Este e-mail já está cadastrado." });
	}

	const passwordHash = await hashPassword(data.password);

	const user = await database.user.create({
		data: {
			name: data.name,
			email: data.email,
			password: passwordHash,
		},
	});

	sendEmail(user);

	return await generateAuthTokens(user.id, user.email, user.name, user.role);
}

export { signUp };
