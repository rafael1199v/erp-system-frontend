type OrderBadgeVariant = "success" | "destructive" | "secondary" | "outline";

const normalizeStatus = (status: string | undefined | null) => (status ?? "").trim().toLowerCase();

export const getOrderStatusLabel = (status: string | undefined | null, fallbackLabel = "Desconocido") => {
	switch (normalizeStatus(status)) {
		case "created":
		case "open":
			return "Abierto";
		case "cancelled":
		case "canceled":
			return "Cancelado";
		case "paid":
			return "Pagado";
		default:
			return fallbackLabel;
	}
};

export const getOrderStatusBadgeVariant = (status: string | undefined | null): OrderBadgeVariant => {
	switch (normalizeStatus(status)) {
		case "created":
		case "open":
			return "success";
		case "cancelled":
		case "canceled":
			return "destructive";
		case "paid":
			return "secondary";
		default:
			return "outline";
	}
};

export const isOrderOpen = (status: string | undefined | null) => {
	const normalized = normalizeStatus(status);
	return normalized === "created" || normalized === "open";
};

export const canCancelOrder = (status: string | undefined | null) => {
	return isOrderOpen(status);
};
