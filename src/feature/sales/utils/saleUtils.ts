export function parseTaxPercentage(rawValue: string) {
	const normalizedValue = rawValue.trim().replace(",", ".");
	return Number.parseFloat(normalizedValue);
}
