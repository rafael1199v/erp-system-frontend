export enum OrderStatus {
	Open = 1,
	Cancelled = 2,
	Paid = 3,
}

type OrderBadgeVariant = "success" | "destructive" | "secondary" | "outline";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
	[OrderStatus.Open]: "Abierto",
	[OrderStatus.Cancelled]: "Cancelado",
	[OrderStatus.Paid]: "Pagado",
};

export const ORDER_STATUS_BADGE_VARIANTS: Record<OrderStatus, OrderBadgeVariant> = {
	[OrderStatus.Open]: "success",
	[OrderStatus.Cancelled]: "destructive",
	[OrderStatus.Paid]: "secondary",
};

export const getOrderStatusLabel = (statusId: number, fallbackLabel = "Desconocido") => {
	if (statusId in ORDER_STATUS_LABELS) {
		return ORDER_STATUS_LABELS[statusId as OrderStatus];
	}

	return fallbackLabel;
};

export const getOrderStatusBadgeVariant = (statusId: number) => {
	if (statusId in ORDER_STATUS_BADGE_VARIANTS) {
		return ORDER_STATUS_BADGE_VARIANTS[statusId as OrderStatus];
	}

	return "outline" as const;
};

export const isOrderOpen = (statusId: number | undefined | null) => {
	return statusId === OrderStatus.Open;
};

export const canCancelOrder = (statusId: number | undefined | null) => {
	return isOrderOpen(statusId);
};
