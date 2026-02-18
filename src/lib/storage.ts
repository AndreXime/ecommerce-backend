import { randomUUID } from "node:crypto";
import {
	DeleteObjectCommand,
	GetObjectCommand,
	ListBucketsCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import environment from "@/lib/environment";
import { log } from "./dev";

class StorageProvider {
	private client: S3Client;

	constructor() {
		this.client = new S3Client({
			endpoint: environment.S3_ENDPOINT_URL,
			apiVersion: "latest",
			region: environment.S3_REGION,
			credentials: {
				accessKeyId: environment.S3_ACCESS_KEY,
				secretAccessKey: environment.S3_SECRET_KEY,
			},
			forcePathStyle: true,
		});
	}

	/** Retorna o link de upload para o frontend */
	async getUploadUrl(options: {
		fileType: string;
		fileKey?: string | null;
		metadata?: Record<string, string>;
		cacheControl?: string;
	}) {
		try {
			const fileKey = options.fileKey ?? randomUUID();

			const signedUrl = await getSignedUrl(
				this.client,
				new PutObjectCommand({
					Bucket: environment.S3_BUCKET,
					Key: fileKey,
					ContentType: options.fileType,
					CacheControl: options.cacheControl,
					Metadata: options.metadata,
				}),
				{
					expiresIn: 600,
				},
			);

			return { uploadUrl: signedUrl, fileKey };
		} catch {
			throw new Error("Falha ao gerar URL de upload de arquivo");
		}
	}

	/** Retorna o link de download para o frontend */
	async getDownloadUrl(fileKey?: string | null) {
		if (!fileKey) return { url: "" };
		try {
			const signedUrl = await getSignedUrl(
				this.client,
				new GetObjectCommand({
					Bucket: environment.S3_BUCKET,
					Key: fileKey,
				}),
				{
					expiresIn: 1000,
				},
			);

			return {
				url: signedUrl,
			};
		} catch {
			throw new Error("Falha ao consultar URL de arquivo");
		}
	}

	async deleteFile(fileKey: string) {
		try {
			await this.client.send(
				new DeleteObjectCommand({
					Bucket: environment.S3_BUCKET,
					Key: fileKey,
				}),
			);
			return true;
		} catch (error) {
			console.error(`Erro ao deletar arquivo ${fileKey}:`, error);
			throw new Error("Falha ao deletar arquivo");
		}
	}

	async uploadFile(options: {
		data: Buffer | ReadableStream;
		fileType: string;
		fileKey?: string | null;
		metadata?: Record<string, string>;
		cacheControl?: string;
	}) {
		try {
			const fileKey = options.fileKey ?? randomUUID();

			await this.client.send(
				new PutObjectCommand({
					Bucket: environment.S3_BUCKET,
					Key: fileKey,
					Body: options.data,
					ContentType: options.fileType,
					CacheControl: options.cacheControl,
					Metadata: options.metadata,
				}),
			);

			return { fileKey };
		} catch (error) {
			console.error("Falha ao fazer upload direto para o bucket:", error);
			throw new Error("Falha ao fazer upload direto do arquivo");
		}
	}

	async downloadFile(fileKey: string) {
		try {
			const response = await this.client.send(
				new GetObjectCommand({
					Bucket: environment.S3_BUCKET,
					Key: fileKey,
				}),
			);

			const byteArray = await response.Body?.transformToByteArray();

			if (!byteArray) {
				throw new Error("Não foi possivel transformar a reposta");
			}

			return {
				content: Buffer.from(byteArray),
				contentType: response.ContentType,
			};
		} catch (error) {
			console.error("Erro ao baixar arquivo:", error);
			throw new Error("Falha ao baixar o arquivo diretamente do S3");
		}
	}

	/** URL pública sem autenticação — funciona quando o bucket tem leitura pública */
	getPublicUrl(fileKey: string) {
		return `${environment.S3_ENDPOINT_URL}/${environment.S3_BUCKET}/${fileKey}`;
	}

	async testConnection(): Promise<boolean> {
		try {
			await this.client.send(new ListBucketsCommand({}));

			log("Conexão S3 bem-sucedida.", "success");
			return true;
		} catch (error) {
			console.error("Falha na conexão S3:", error);
			return false;
		}
	}
}

const storage = new StorageProvider();
export default storage;
