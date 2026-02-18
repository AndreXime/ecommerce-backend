import { hashPassword } from "@/modules/auth/shared/hash";
import type { Prisma } from "../client/client";
import { database } from "../database";
import { generateSeedProductImages, type ImageDef } from "./seedProductsImages";

async function seedCategories(tx: Prisma.TransactionClient) {
	const categories = ["Eletrônicos", "Roupas", "Calçados", "Casa & Decoração", "Esportes"];
	return tx.category.createManyAndReturn({
		data: categories.map((name) => ({ name })),
		skipDuplicates: true,
	});
}

async function seedProducts(tx: Prisma.TransactionClient, categoryIds: string[]) {
	const [eletronicos, roupas, calcados] = categoryIds;

	const products = [
		{
			name: "Fone Bluetooth Pro",
			tag: "fone-bluetooth-pro",
			price: 299.9,
			discountPercentage: 10,
			isNew: true,
			inStock: true,
			description: "Fone de ouvido bluetooth com cancelamento de ruído ativo e bateria de 30h.",
			specs: { Autonomia: "30h", Conectividade: "Bluetooth 5.3", Peso: "250g" },
			categoryId: eletronicos,
			images: [
				{ label: "Fone Bluetooth Pro", bg: "#1e1e2e", textColor: "#89b4fa", position: 0 },
				{ label: "Vista Traseira", bg: "#181825", textColor: "#cba6f7", position: 1 },
			] satisfies ImageDef[],
			options: [{ label: "Cor", uiType: "color" as const, values: ["bg-black", "bg-white", "bg-blue-600"] }],
		},
		{
			name: "Smartwatch Ultra",
			tag: "smartwatch-ultra",
			price: 899.9,
			isNew: true,
			inStock: true,
			description: "Smartwatch com monitoramento de saúde avançado, GPS integrado e tela AMOLED.",
			specs: { Tela: 'AMOLED 1.9"', GPS: "Sim", Resistência: "IP68", Bateria: "7 dias" },
			categoryId: eletronicos,
			images: [{ label: "Smartwatch Ultra", bg: "#24273a", textColor: "#f5a97f", position: 0 }] satisfies ImageDef[],
			options: [{ label: "Cor", uiType: "color" as const, values: ["bg-gray-800", "bg-yellow-500"] }],
		},
		{
			name: "Camiseta Premium",
			tag: "camiseta-premium",
			price: 89.9,
			discountPercentage: 20,
			inStock: true,
			description: "Camiseta 100% algodão premium, corte moderno e confortável.",
			specs: { Material: "100% Algodão", Lavagem: "Máquina" },
			categoryId: roupas,
			images: [{ label: "Camiseta Premium", bg: "#eff1f5", textColor: "#4c4f69", position: 0 }] satisfies ImageDef[],
			options: [
				{ label: "Tamanho", uiType: "pill" as const, values: ["P", "M", "G", "GG"] },
				{ label: "Cor", uiType: "color" as const, values: ["bg-white", "bg-black", "bg-blue-500"] },
			],
		},
		{
			name: "Tênis Runner 360",
			tag: "tenis-runner-360",
			price: 399.9,
			isNew: true,
			inStock: true,
			description: "Tênis de corrida com amortecimento avançado e solado antiderrapante.",
			specs: { Solado: "Borracha antiderrapante", Cabedal: "Mesh respirável", Drop: "8mm" },
			categoryId: calcados,
			images: [{ label: "Runner 360", bg: "#11111b", textColor: "#f38ba8", position: 0 }] satisfies ImageDef[],
			options: [
				{ label: "Numeração", uiType: "pill" as const, values: ["38", "39", "40", "41", "42", "43"] },
				{ label: "Cor", uiType: "color" as const, values: ["bg-red-500", "bg-black", "bg-white"] },
			],
		},
	];

	const productImages = await generateSeedProductImages(products);

	for (const p of products) {
		const { images: _, options, specs, ...data } = p;
		await tx.product.create({
			data: {
				...data,
				specs,
				images: { create: productImages[p.tag] },
				options: { create: options },
			},
		});
	}
}

async function seedUsers(tx: Prisma.TransactionClient) {
	const users = [
		{
			email: "admin@example.com",
			password: await hashPassword("123456"),
			name: "Admin Sistema",
			role: "ADMIN" as const,
			registration: "ADM-001",
			phone: "(11) 99999-0000",
		},
		{
			email: "user@example.com",
			password: await hashPassword("123456"),
			name: "João Silva",
			registration: "USR-001",
			phone: "(11) 98888-1111",
		},
		{
			email: "user2@example.com",
			password: await hashPassword("123456"),
			name: "André Ximenes",
			registration: "USR-002",
			phone: "(21) 97777-2222",
		},
	] satisfies Prisma.UserCreateInput[];

	return tx.user.createManyAndReturn({ data: users, skipDuplicates: true });
}

async function seed() {
	console.log("[seed] iniciando...");
	try {
		await database.$transaction(
			async (tx) => {
				const userCount = await tx.user.count();
				if (userCount > 0) {
					console.log("[seed] banco já populado, abortando.");
					return;
				}

				console.log("[seed] criando usuários...");
				const users = await seedUsers(tx);

				console.log("[seed] criando categorias...");
				const categories = await seedCategories(tx);

				console.log("[seed] criando produtos...");
				await seedProducts(
					tx,
					categories.map((c) => c.id),
				);

				const customer = users.find((u) => u.role === "CUSTOMER");
				if (customer) {
					console.log(`[seed] criando endereço e cartão para "${customer.name}"...`);
					await tx.address.create({
						data: {
							userId: customer.id,
							type: "casa",
							street: "Rua das Flores, 123 - Jardim Primavera",
							city: "São Paulo",
							isDefault: true,
						},
					});
					await tx.paymentCard.create({
						data: {
							userId: customer.id,
							brand: "Visa",
							last4: "4242",
							holder: customer.name.toUpperCase(),
							expiry: "12/28",
						},
					});
				}

				console.log("[seed] concluído com sucesso.");
			},
			{ maxWait: 5000, timeout: 300000 },
		);
	} catch (error) {
		console.error("Erro ao executar seed:\n", error);
		process.exit(1);
	}
}

await seed();
