import { Queue, Worker } from "bullmq";
import nodemailer from "nodemailer";
import { log } from "@/lib/dev";
import environment from "@/lib/environment";
import { dispatchAbandonedCarts, dispatchPromotions } from "./email/dispatchers";
import { abandonedCartTemplate, forgotPasswordTemplate, promotionTemplate, welcomeTemplate } from "./email/templates";
import type { AbandonedCartJob, EmailJobData, ForgotPasswordJob, PromotionJob, WelcomeJob } from "./email/types";

const FROM = '"Ecommerce" <noreply@ecommerce.com>';
const PROMOTION_INTERVAL_MS = 36 * 60 * 60 * 1000;
const ABANDONED_CART_INTERVAL_MS = 30 * 60 * 1000; // 30 minutos

const connection = { url: environment.REDIS_URL };
const jobOptions = { attempts: 3, backoff: { type: "exponential", delay: 5000 } };

export const emailQueue = new Queue<EmailJobData>("email-queue", { connection });

const transport = nodemailer.createTransport({
	host: environment.EMAIL_SERVICE_HOST,
	port: environment.EMAIL_SERVICE_PORT,
	secure: environment.ENV === "PROD",
	tls: { rejectUnauthorized: environment.ENV === "PROD" },
});

// ─── Enfileiradores públicos ──────────────────────────────────────────────────

export async function sendWelcomeEmail(user: { name: string; email: string }) {
	await emailQueue.add("welcome", { type: "welcome", ...user }, jobOptions).catch(() => {});
}

export async function sendForgotPasswordEmail(user: { name: string; email: string }, resetLink: string) {
	await emailQueue.add("forgot-password", { type: "forgot-password", ...user, resetLink }, jobOptions).catch(() => {});
}

// ─── Handlers do worker ───────────────────────────────────────────────────────

const dispatch = (type: string) => !type.startsWith("dispatch-");

const emailHandlers: Record<string, (data: EmailJobData) => Promise<unknown>> = {
	welcome: (data) => {
		const { name, email } = data as WelcomeJob;
		return transport.sendMail({ from: FROM, to: email, subject: "Bem-vindo!", html: welcomeTemplate(name) });
	},

	"forgot-password": (data) => {
		const { name, email, resetLink } = data as ForgotPasswordJob;
		return transport.sendMail({
			from: FROM,
			to: email,
			subject: "Redefinição de senha",
			html: forgotPasswordTemplate(name, resetLink),
		});
	},

	promotion: (data) => {
		const { name, email, products } = data as PromotionJob;
		return transport.sendMail({
			from: FROM,
			to: email,
			subject: "Ofertas selecionadas para você!",
			html: promotionTemplate(name, products),
		});
	},

	"abandoned-cart": (data) => {
		const { name, email, items } = data as AbandonedCartJob;
		return transport.sendMail({
			from: FROM,
			to: email,
			subject: "Você esqueceu algo no carrinho!",
			html: abandonedCartTemplate(name, items),
		});
	},

	"dispatch-promotions": () => dispatchPromotions((jobs) => emailQueue.addBulk(jobs as never[])),
	"dispatch-abandoned-carts": () => dispatchAbandonedCarts((jobs) => emailQueue.addBulk(jobs as never[])),
};

// ─── Setup ────────────────────────────────────────────────────────────────────

export const setupEmailWorker = async () => {
	const worker = new Worker<EmailJobData>(
		"email-queue",
		async (job) => {
			await emailHandlers[job.data.type](job.data);
		},
		{ connection },
	);

	worker.on("completed", (job) => {
		if (dispatch(job.data.type)) {
			log(`[Worker] Email "${job.data.type}" enviado para ${(job.data as { email: string }).email}`, "success");
		}
	});

	worker.on("failed", (_job, err) => {
		log(`[Worker] Job falhou: ${err.message}`, "error");
	});

	try {
		await transport.verify();
		log("Conexão com serviço de email bem-sucedida.", "success");
	} catch {
		log("Falha na conexão com o SMTP.", "error");
	}
};

export const setupPromotionScheduler = async () => {
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

export const setupAbandonedCartScheduler = async () => {
	await emailQueue.add(
		"dispatch-abandoned-carts",
		{ type: "dispatch-abandoned-carts" },
		{
			repeat: { every: ABANDONED_CART_INTERVAL_MS },
			jobId: "abandoned-cart-scheduler",
		},
	);
	log("Agendador de carrinho abandonado configurado (intervalo: 30min).", "success");
};
