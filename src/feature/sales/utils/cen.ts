export const hasCen = (value: unknown): value is string => {
	return typeof value === "string" && value.trim().length > 0;
};

export const normalizeCen = (value: unknown): string | null => {
	if (!hasCen(value)) {
		return null;
	}

	return value.trim();
};
