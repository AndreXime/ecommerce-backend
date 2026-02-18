import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import storage from "@/lib/storage";

export type ImageDef = {
	label: string;
	bg: string;
	textColor: string;
	position: number;
};

export type SeedImage = { url: string; position: number };

function hasMagick(): boolean {
	const proc = Bun.spawnSync(["which", "magick"]);
	return proc.exitCode === 0;
}

function placeholdUrl(def: ImageDef): string {
	const bg = def.bg.replace("#", "");
	const text = def.textColor.replace("#", "");
	const label = def.label.replace(/\s+/g, "+");
	return `https://placehold.co/600x600/${bg}/${text}/png?text=${label}`;
}

async function generateAndUpload(def: ImageDef, productTag: string, date: string): Promise<SeedImage> {
	const tmpPath = `/tmp/seed-${productTag}-${def.position}-${randomUUID()}.png`;
	const fileKey = `products/seed/${productTag}-${def.position}-${date}.png`;

	const proc = Bun.spawnSync([
		"magick",
		"-size",
		"600x600",
		`xc:${def.bg}`,
		"-fill",
		def.textColor,
		"-font",
		"DejaVu-Sans-Bold",
		"-pointsize",
		"60",
		"-gravity",
		"Center",
		"-draw",
		`text 0,0 '${def.label}'`,
		tmpPath,
	]);

	if (proc.exitCode !== 0) {
		throw new Error(`magick falhou para "${def.label}": ${proc.stderr.toString()}`);
	}

	const buffer = Buffer.from(await Bun.file(tmpPath).arrayBuffer());
	await storage.uploadFile({
		data: buffer,
		fileType: "image/png",
		fileKey,
		cacheControl: "public, max-age=31536000, immutable",
	});
	await unlink(tmpPath);

	return { url: storage.getPublicUrl(fileKey), position: def.position };
}

export async function generateSeedProductImages(
	products: { tag: string; images: ImageDef[] }[],
): Promise<Record<string, SeedImage[]>> {
	const result: Record<string, SeedImage[]> = {};
	const useMagick = hasMagick();
	const date = new Date().toISOString().slice(0, 19).replace("T", "-").replace(/:/g, "-");

	console.log(`[imagens] usando ${useMagick ? "magick + S3" : "placehold.co (magick não encontrado)"}`);

	for (const product of products) {
		console.log(`[imagens] gerando imagens de "${product.tag}"...`);
		result[product.tag] = await Promise.all(
			product.images.map((img) =>
				useMagick
					? generateAndUpload(img, product.tag, date)
					: Promise.resolve({ url: placeholdUrl(img), position: img.position }),
			),
		);
	}

	return result;
}
