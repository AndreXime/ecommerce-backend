import type { Prisma } from "prisma";

type SelectedVariant = Record<string, string> | null | undefined;

export function buildVariantSignature(selectedVariant: SelectedVariant) {
	if (!selectedVariant || Object.keys(selectedVariant).length === 0) {
		return "";
	}

	return JSON.stringify(
		Object.entries(selectedVariant)
			.sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
			.reduce<Record<string, string>>((signature, [key, value]) => {
				signature[key] = value;
				return signature;
			}, {}),
	);
}

export function normalizeSelectedVariant(selectedVariant: SelectedVariant): Prisma.InputJsonValue | undefined {
	if (!selectedVariant || Object.keys(selectedVariant).length === 0) {
		return undefined;
	}

	return Object.entries(selectedVariant)
		.sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
		.reduce<Record<string, string>>((variant, [key, value]) => {
			variant[key] = value;
			return variant;
		}, {});
}
