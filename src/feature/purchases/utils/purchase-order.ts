import type { PurchaseOrderStatus } from "../types/purchase";

type PurchaseOrderBadgeVariant = "success" | "destructive" | "secondary" | "outline" | "warning";

const normalizeStatus = (status: string | undefined | null) => (status ?? "").trim().toLowerCase();

export const getPurchaseOrderStatusLabel = (status: string | undefined | null) => {
	switch (normalizeStatus(status)) {
		case "pending":
			return "Pendiente";
		case "confirmed":
			return "Confirmada";
		case "cancelled":
		case "canceled":
			return "Cancelada";
		default:
			return "Desconocido";
	}
};

export const getPurchaseOrderStatusBadgeVariant = (status: string | undefined | null): PurchaseOrderBadgeVariant => {
	switch (normalizeStatus(status)) {
		case "pending":
			return "warning";
		case "confirmed":
			return "success";
		case "cancelled":
		case "canceled":
			return "destructive";
		default:
			return "outline";
	}
};

export const canConfirmPurchaseOrder = (status: PurchaseOrderStatus | string | undefined | null) => {
	return normalizeStatus(status) === "pending";
};

export const formatPurchaseDate = (value: string | null | undefined) => {
	if (!value) {
		return "-";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "-";
	}

	return new Intl.DateTimeFormat("es-BO", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
};
