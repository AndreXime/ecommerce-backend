import { HTTPException } from "hono/http-exception";
import { database } from "@/database/database";
import { verifyPassword } from "@/modules/auth/shared/hash";
import { generateAuthTokens } from "../shared/tokens";
import type { UserSignIn } from "./login.schema";

async function signIn({ email, password }: UserSignIn) {
	const user = await database.user.findUnique({
		where: {
			email,
		},
	});

	const isPasswordValid = await verifyPassword(password, user.password);

	if (!user || !isPasswordValid) {
		throw new HTTPException(401, { message: "Email ou senha inválidos" });
	}

	return await generateAuthTokens(user.id, user.email, user.name, user.role);
}

export { signIn };
