import type { Prisma } from "prisma";
import type { ErrorResponse } from ".";

const fieldTranslations: Record<string, string> = {
	email: "E-mail",
	password: "Senha",
	username: "Nome de usuário",
	cpf: "CPF",
	phone: "Telefone",
};

const errorPrisma = (error: Prisma.PrismaClientKnownRequestError): ErrorResponse => {
	let response: ErrorResponse = {
		message: "Erro interno no servidor.",
	};

	switch (error.code) {
		// P2002: Violação de Unique Constraint (Duplicidade)
		case "P2002": {
			const target = (error.meta?.target as string[]) || [];
			// Pega o primeiro campo que deu erro (ex: 'email')
			const fieldName = target[0] || "";
			const translatedField = fieldTranslations[fieldName] || fieldName;

			response = {
				message: `${translatedField} já está em uso.`,
			};
			break;
		}

		// P2025: Registro não encontrado (comum em updates/deletes)
		case "P2025": {
			response = {
				message: "Registro não encontrado ou já removido.",
			};
			break;
		}

		// P2003: Violação de Foreign Key (ex: deletar usuário que tem posts)
		case "P2003": {
			const fieldName = (error.meta?.modelName as string) || "campo relacionado";
			response = {
				message: `Não é possível completar a ação devido a dependências em: ${fieldName}.`,
			};
			break;
		}

		// P5010: Erro de conexão (Fetch Client)
		// P1001: Erro de conexão (Geral)
		case "P5010":
		case "P1001": {
			response = {
				message: "Não foi possível conectar ao banco de dados.",
			};
			break;
		}

		// Caso queira tratar argumentos inválidos (ex: string em campo int)
		case "P2000": {
			response = {
				message: "O valor fornecido para o campo é muito longo.",
			};
			break;
		}

		default:
			// Em desenvolvimento, você pode querer ver o erro original:
			if (process.env.NODE_ENV === "development") {
				response.message = error.message;
			}
			break;
	}

	return response;
};

export { errorPrisma };
