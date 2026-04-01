import { HTTPException } from "hono/http-exception";

type SelectedVariant = Record<string, string> | null | undefined;

interface ProductOption {
	readonly label: string;
	readonly values: ReadonlyArray<string>;
}

export function validateSelectedVariant(
	selectedVariant: SelectedVariant,
	options: ReadonlyArray<ProductOption>,
	productName: string,
) {
	const normalizedVariant = normalizeSelectedVariantInput(selectedVariant);

	if (options.length === 0) {
		if (normalizedVariant) {
			throw new HTTPException(400, {
				message: `O produto "${productName}" não possui variantes selecionáveis.`,
			});
		}

		return undefined;
	}

	if (!normalizedVariant) {
		throw new HTTPException(400, {
			message: `Selecione todas as variantes obrigatórias do produto "${productName}".`,
		});
	}

	if (Object.keys(normalizedVariant).length !== options.length) {
		throw new HTTPException(400, {
			message: `As variantes do produto "${productName}" devem corresponder exatamente às opções cadastradas.`,
		});
	}

	const optionsByLabel = new Map(options.map((option) => [option.label, option] as const));

	for (const [label, value] of Object.entries(normalizedVariant)) {
		const option = optionsByLabel.get(label);

		if (!option) {
			throw new HTTPException(400, {
				message: `A variante "${label}" não existe para o produto "${productName}".`,
			});
		}

		if (!option.values.includes(value)) {
			throw new HTTPException(400, {
				message: `O valor "${value}" não é válido para a variante "${label}" do produto "${productName}".`,
			});
		}
	}

	return normalizedVariant;
}

export function formatSelectedVariant(selectedVariant: SelectedVariant, options: ReadonlyArray<ProductOption>) {
	const normalizedVariant = normalizeSelectedVariantInput(selectedVariant);

	if (!normalizedVariant) {
		return null;
	}

	return options
		.map((option) => normalizedVariant[option.label])
		.filter((value): value is string => Boolean(value))
		.join(", ");
}

function normalizeSelectedVariantInput(selectedVariant: SelectedVariant) {
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
