import { HTTPException } from "hono/http-exception";
import { Prisma } from "prisma";
import { database } from "@/database/database";
import { sendWelcomeEmail } from "@/lib/email";
import { hashPassword } from "@/modules/auth/shared/hash";
import { generateAuthTokens } from "../shared/tokens";
import type { RegisterRequest } from "./register.schema";

async function signUp(data: RegisterRequest) {
	const passwordHash = await hashPassword(data.password);

	try {
		const user = await database.user.create({
			data: {
				name: data.name,
				email: data.email,
				password: passwordHash,
			},
		});

		sendWelcomeEmail(user);

		return generateAuthTokens(user.id, user.email, user.name, user.role, user.sessionVersion);
	} catch (error: unknown) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
			throw new HTTPException(409, { message: "Este e-mail já está cadastrado." });
		}

		throw error;
	}
}

export { signUp };
