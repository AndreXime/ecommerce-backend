import { Queue, Worker } from "bullmq";
import nodemailer from "nodemailer";
import { database } from "@/database/database";
import { log } from "@/lib/dev";
import environment from "@/lib/environment";

// ─── Tipos de job ────────────────────────────────────────────────────────────

type WelcomeJob = {
	type: "welcome";
	name: string;
	email: string;
};

type ForgotPasswordJob = {
	type: "forgot-password";
	name: string;
	email: string;
	resetLink: string;
};

type PromotionProduct = {
	id: string;
	name: string;
	price: number;
	discountPercentage: number | null;
	image: string;
};

type PromotionJob = {
	type: "promotion";
	name: string;
	email: string;
	products: PromotionProduct[];
};

// Meta-job repetível: consulta o banco e enfileira um PromotionJob por usuário
type DispatchPromotionsJob = {
	type: "dispatch-promotions";
};

type EmailJobData = WelcomeJob | ForgotPasswordJob | PromotionJob | DispatchPromotionsJob;

// ─── Infraestrutura ───────────────────────────────────────────────────────────

const FROM = '"Ecommerce" <noreply@ecommerce.com>';
const PROMOTION_INTERVAL_MS = 36 * 60 * 60 * 1000; // 36 horas

const queueConnection = { url: environment.REDIS_URL };

const emailQueue = new Queue<EmailJobData>("email-queue", {
	connection: queueConnection,
});

const mailTransport = nodemailer.createTransport({
	host: environment.EMAIL_SERVICE_HOST,
	port: environment.EMAIL_SERVICE_PORT,
	secure: environment.ENV === "PROD",
	tls: { rejectUnauthorized: environment.ENV === "PROD" },
});

const jobOptions = {
	attempts: 3,
	backoff: { type: "exponential", delay: 1000 },
};

// ─── Enfileiradores públicos ──────────────────────────────────────────────────

export async function sendWelcomeEmail(user: { name: string; email: string }) {
	try {
		await emailQueue.add("welcome", { type: "welcome", ...user }, jobOptions);
	} catch (error) {
		console.error("Falha ao agendar email de boas-vindas", error);
	}
}

export async function sendForgotPasswordEmail(user: { name: string; email: string }, resetLink: string) {
	try {
		await emailQueue.add("forgot-password", { type: "forgot-password", ...user, resetLink }, jobOptions);
	} catch (error) {
		console.error("Falha ao agendar email de redefinição de senha", error);
	}
}

// ─── Templates HTML ───────────────────────────────────────────────────────────

function productCardHtml(p: PromotionProduct) {
	const priceFormatted = p.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
	const originalPrice = p.discountPercentage ? `<s style="color:#999;font-size:13px">${priceFormatted}</s>` : "";
	const finalPrice = p.discountPercentage
		? (p.price * (1 - p.discountPercentage / 100)).toLocaleString("pt-BR", {
				style: "currency",
				currency: "BRL",
			})
		: priceFormatted;
	const badge = p.discountPercentage
		? `<span style="background:#e11d48;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:bold">-${p.discountPercentage}%</span>`
		: "";

	return `
    <td style="width:45%;padding:8px;vertical-align:top;text-align:center">
      <a href="${environment.FRONTEND_URL}/products/${p.id}" style="text-decoration:none;color:inherit">
        <img src="${p.image}" alt="${p.name}" width="160" height="160"
          style="object-fit:cover;border-radius:8px;display:block;margin:0 auto" />
        <p style="margin:8px 0 4px;font-weight:600;font-size:14px">${p.name}</p>
        ${badge}
        <p style="margin:4px 0">${originalPrice} <strong>${finalPrice}</strong></p>
      </a>
    </td>`;
}

function promotionEmailHtml(name: string, products: PromotionProduct[]) {
	const rows: string[] = [];
	for (let i = 0; i < products.length; i += 2) {
		const left = productCardHtml(products[i]);
		const right = products[i + 1] ? productCardHtml(products[i + 1]) : "<td></td>";
		rows.push(`<tr>${left}${right}</tr>`);
	}

	return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
      <h2 style="margin-bottom:4px">Olá, ${name}!</h2>
      <p style="color:#555;margin-top:0">Confira as ofertas que separamos para você hoje:</p>
      <table style="width:100%;border-spacing:12px">${rows.join("")}</table>
      <p style="text-align:center;margin-top:24px">
        <a href="${environment.FRONTEND_URL}/products"
          style="display:inline-block;padding:12px 32px;background:#111;color:#fff;
                 text-decoration:none;border-radius:6px;font-weight:bold">
          Ver todos os produtos
        </a>
      </p>
      <p style="font-size:12px;color:#999;text-align:center;margin-top:24px">
        Você recebe este email por ser cadastrado em nossa loja.<br/>
        <a href="${environment.FRONTEND_URL}" style="color:#999">Cancelar inscrição</a>
      </p>
    </div>`;
}

// ─── Handlers do worker ───────────────────────────────────────────────────────

async function handleDispatchPromotions() {
	const [users, rawProducts] = await Promise.all([
		database.user.findMany({
			where: { deletedAt: null },
			select: { name: true, email: true },
		}),
		database.product.findMany({
			where: {
				inStock: true,
				OR: [{ discountPercentage: { not: null } }, { isNew: true }],
			},
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
		name: "promotion" as const,
		data: { type: "promotion" as const, ...user, products },
		opts: jobOptions,
	}));

	await emailQueue.addBulk(jobs);
	log(`[Scheduler] ${users.length} emails de promoção enfileirados`, "info");
}

const emailHandlers: Record<string, (data: EmailJobData) => Promise<unknown>> = {
	welcome: (data) => {
		const job = data as WelcomeJob;
		return mailTransport.sendMail({
			from: FROM,
			to: job.email,
			subject: "Bem-vindo!",
			html: `
        <h2>Olá, ${job.name}!</h2>
        <p>Sua conta foi criada com sucesso. Seja bem-vindo à nossa loja!</p>
      `,
		});
	},

	"forgot-password": (data) => {
		const job = data as ForgotPasswordJob;
		return mailTransport.sendMail({
			from: FROM,
			to: job.email,
			subject: "Redefinição de senha",
			html: `
        <h2>Olá, ${job.name}!</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p>
          <a href="${job.resetLink}" style="
            display:inline-block;padding:12px 24px;background:#111;color:#fff;
            text-decoration:none;border-radius:6px;font-weight:bold
          ">Redefinir senha</a>
        </p>
        <p>Este link expira em <strong>1 hora</strong>.</p>
        <p>Se você não solicitou isso, ignore este email.</p>
      `,
		});
	},

	promotion: (data) => {
		const job = data as PromotionJob;
		return mailTransport.sendMail({
			from: FROM,
			to: job.email,
			subject: "🛍️ Ofertas selecionadas para você!",
			html: promotionEmailHtml(job.name, job.products),
		});
	},

	// Meta-job: não envia email, apenas despacha os jobs individuais
	"dispatch-promotions": async () => {
		await handleDispatchPromotions();
	},
};

// ─── Setup ────────────────────────────────────────────────────────────────────

export const setupEmailWorker = async () => {
	const worker = new Worker<EmailJobData>(
		"email-queue",
		async (job) => {
			const handler = emailHandlers[job.data.type];
			await handler(job.data);
			return true;
		},
		{ connection: queueConnection },
	);

	worker.on("completed", (job) => {
		if (job.data.type !== "dispatch-promotions") {
			const to = (job.data as { email: string }).email;
			log(`[Worker] Email "${job.data.type}" enviado para ${to}`, "success");
		}
	});

	worker.on("failed", (_job, err) => {
		log(`[Worker] Job falhou: ${err.message}`, "error");
	});

	try {
		await mailTransport.verify();
		log("Conexão com serviço de email bem-sucedida.", "success");
	} catch {
		log("Falha na conexão com o SMTP.", "error");
	}
};

export const setupPromotionScheduler = async () => {
	// BullMQ deduplica por chave — seguro chamar a cada restart
	await emailQueue.add(
		"dispatch-promotions",
		{ type: "dispatch-promotions" },
		{
			repeat: { every: PROMOTION_INTERVAL_MS },
			jobId: "promotion-scheduler",
		},
	);

	log("Agendador de promoções configurado (intervalo: 36h).", "success");
};
