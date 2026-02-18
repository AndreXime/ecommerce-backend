import { database } from "@/database/database";
import { log } from "@/lib/dev";
import type { AbandonedCartItem, AbandonedCartJob, EmailJobData, PromotionJob, PromotionProduct } from "./types";

// Importado no queue.ts para evitar dependência circular
type AddBulkFn = (
	jobs: Array<{ name: string; data: EmailJobData; opts?: Record<string, unknown> }>,
) => Promise<unknown>;

const jobOptions = { attempts: 3, backoff: { type: "exponential", delay: 5000 } };

export async function dispatchPromotions(addBulk: AddBulkFn) {
	const [users, rawProducts] = await Promise.all([
		database.user.findMany({
			where: { deletedAt: null },
			select: { name: true, email: true },
		}),
		database.product.findMany({
			where: { inStock: true, OR: [{ discountPercentage: { not: null } }, { isNew: true }] },
			orderBy: [{ discountPercentage: "desc" }, { createdAt: "desc" }],
			take: 4,
			include: { images: { orderBy: { position: "asc" }, take: 1 } },
		}),
	]);

	if (users.length === 0 || rawProducts.length === 0) return;

	const products: PromotionProduct[] = rawProducts.map((p) => ({
		id: p.id,
		name: p.name,
		price: Number(p.price),
		discountPercentage: p.discountPercentage ? Number(p.discountPercentage) : null,
		image: p.images[0]?.url ?? "",
	}));

	const jobs = users.map((user) => ({
		name: "promotion",
		data: { type: "promotion", ...user, products } satisfies PromotionJob,
		opts: jobOptions,
	}));

	await addBulk(jobs);
	log(`[Scheduler] ${users.length} emails promocionais enfileirados`, "info");
}

export async function dispatchAbandonedCarts(addBulk: AddBulkFn) {
	const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

	const carts = await database.cart.findMany({
		where: {
			updatedAt: { lt: twoHoursAgo },
			reminderSentAt: null,
			items: { some: {} },
		},
		include: {
			user: { select: { name: true, email: true } },
			items: {
				include: {
					product: {
						include: { images: { orderBy: { position: "asc" }, take: 1 } },
					},
				},
			},
		},
	});

	if (carts.length === 0) return;

	const jobs = carts.map((cart) => {
		const items: AbandonedCartItem[] = cart.items.map((i) => ({
			name: i.product.name,
			image: i.product.images[0]?.url ?? "",
			price: Number(i.product.price),
			quantity: i.quantity,
		}));
		return {
			name: "abandoned-cart",
			data: { type: "abandoned-cart", ...cart.user, items } satisfies AbandonedCartJob,
			opts: jobOptions,
		};
	});

	await addBulk(jobs);

	// Marca os carrinhos com $executeRaw para não alterar updatedAt (campo @updatedAt é gerido pelo Prisma client)
	const ids = carts.map((c) => c.id);
	await database.$executeRaw`
		UPDATE carts SET reminder_sent_at = NOW()
		WHERE id = ANY(${ids}::uuid[])
	`;

	log(`[Scheduler] ${carts.length} emails de carrinho abandonado enfileirados`, "info");
}
