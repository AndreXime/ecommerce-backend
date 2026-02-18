import { Queue, Worker } from "bullmq";
import nodemailer from "nodemailer";
import { log } from "@/lib/dev";
import environment from "@/lib/environment";

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

type EmailJobData = WelcomeJob | ForgotPasswordJob;

const FROM = '"Ecommerce" <noreply@ecommerce.com>';

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

const emailHandlers: Record<EmailJobData["type"], (data: EmailJobData) => Promise<nodemailer.SentMessageInfo>> = {
	welcome: (data) =>
		mailTransport.sendMail({
			from: FROM,
			to: data.email,
			subject: "Bem-vindo!",
			html: `
        <h2>Olá, ${data.name}!</h2>
        <p>Sua conta foi criada com sucesso. Seja bem-vindo à nossa loja!</p>
      `,
		}),

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
};

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
		log(`[Worker] Email "${job.data.type}" enviado para ${job.data.email}`, "success");
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
