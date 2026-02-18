import { Queue, Worker } from "bullmq";
import nodemailer from "nodemailer";
import { log } from "@/lib/dev";
import environment from "@/lib/environment";

const emailQueue = new Queue("email-queue", {
	connection: {
		url: environment.REDIS_URL,
	},
});

const mailTransport = nodemailer.createTransport({
	host: environment.EMAIL_SERVICE_HOST,
	port: environment.EMAIL_SERVICE_PORT,
	secure: environment.ENV === "PROD",
	tls: {
		rejectUnauthorized: environment.ENV === "PROD",
	},
});

export async function sendEmail(user: { name: string; email: string }) {
	try {
		await emailQueue.add(
			"welcome-email",
			{
				name: user.name,
				email: user.email,
			},
			{
				attempts: 3,
				backoff: {
					type: "exponential",
					delay: 1000,
				},
			},
		);
	} catch (error) {
		console.error("Falha ao agendar email de boas-vindas", error);
	}
}

export const setupEmailWorker = async () => {
	const worker = new Worker(
		"email-queue",
		async (job) => {
			await mailTransport.sendMail({
				from: '"API Template" <noreply@api.com>',
				to: job.data.email,
				subject: "Bem-vindo!",
				html: `<b>Olá ${job.data.name}</b>, seja bem-vindo ao sistema!`,
			});

			return true;
		},
		{
			connection: {
				url: environment.REDIS_URL,
			},
		},
	);

	worker.on("completed", () => {
		log(`[Worker] Job completado com sucesso!`, "success");
	});

	worker.on("failed", (_job, err) => {
		log(`[Worker] Job falhou: ${err.message}`, "error");
	});

	try {
		await mailTransport.verify();
		log("Conexão com serviço de email bem-sucedida.", "success");
	} catch (error) {
		log("Falha na conexão com o SMTP:", "error");
		console.log(error);
	}
};
