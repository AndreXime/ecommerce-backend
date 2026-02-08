import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { Prisma } from "prisma";
import type { AppBindings } from "@/@types/declarations";

import { errorPrisma } from "./prisma";

export type ErrorResponse = {
	message: string;
};

const errors: ErrorHandler<AppBindings> = async (error, { json }) => {
	let status: ContentfulStatusCode = 400;
	let response: ErrorResponse = {
		message: error.message,
	};

	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		response = errorPrisma(error);
	}

	if (error instanceof HTTPException) {
		status = error.status;

		response = {
			message: error.message,
		};
	}

	return json<ErrorResponse>(response, status);
};

export default errors;
