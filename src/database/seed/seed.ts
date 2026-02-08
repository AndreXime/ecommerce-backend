import { hashPassword } from "@/modules/auth/auth.service";
import type { Prisma } from "../client/client";
import { database } from "../database";

/** Gera os dados dos usuários base. */
const generateBaseUsers = async (): Promise<Prisma.UserCreateInput[]> => {
	return [
		{
			email: "user@example.com",
			password: await hashPassword("123456"),
			name: "João Silva",
		},

		{
			email: "user2@example.com",
			password: await hashPassword("123456"),
			name: "André Ximenes",
		},
		{
			email: "user3@example.com",
			password: await hashPassword("123456"),
			name: "Maria graça",
		},
	] satisfies Prisma.UserCreateInput[];
};

/** Cria os usuários base e retorna os usuários especiais. */
async function seedUsers(transaction: Prisma.TransactionClient) {
	console.log("Criando usuários...");
	const usersData = await generateBaseUsers();

	await transaction.user.createMany({
		data: usersData,
		skipDuplicates: true,
	});
}

async function seed() {
	try {
		await database.$transaction(
			async (transaction) => {
				console.log("Iniciando seed de dados...");

				const userCount = await transaction.user.count();
				if (userCount === 0) {
					await seedUsers(transaction);
				} else {
					console.log("Já existem usuarios no sistema, pulando seed...");
				}

				console.log("Seed concluído com sucesso!");
			},
			{
				maxWait: 5000,
				timeout: 300000,
			},
		);
	} catch (error) {
		console.error("Erro ao executar seed:\n", error);
	}
}

await seed();
