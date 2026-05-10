export enum OrderDetailStatus {
	Created = "created",
	Preparing = "preparing",
	Delivered = "delivered",
	Canceled = "canceled",
}

export const ORDER_DETAIL_STATUS_LABELS: Record<OrderDetailStatus, string> = {
	[OrderDetailStatus.Created]: "Pendiente",
	[OrderDetailStatus.Preparing]: "En preparacion",
	[OrderDetailStatus.Delivered]: "Listo",
	[OrderDetailStatus.Canceled]: "Cancelado",
};

export const normalizeOrderDetailStatus = (status: string | undefined | null) => {
	const normalized = (status ?? "").trim().toLowerCase();
	return normalized === "cancelled" ? OrderDetailStatus.Canceled : normalized;
};

export const getOrderDetailStatusLabel = (status: string | undefined | null, fallbackLabel?: string) => {
	const normalized = normalizeOrderDetailStatus(status);

	if (normalized in ORDER_DETAIL_STATUS_LABELS) {
		return ORDER_DETAIL_STATUS_LABELS[normalized as OrderDetailStatus];
	}

	return fallbackLabel ?? "Desconocido";
};

export const canAdvanceKdsStatus = (status: string | undefined | null) => {
	const normalized = normalizeOrderDetailStatus(status);
	return normalized === OrderDetailStatus.Created || normalized === OrderDetailStatus.Preparing;
};

export const getNextKdsStatus = (status: string | undefined | null): OrderDetailStatus | null => {
	const normalized = normalizeOrderDetailStatus(status);

	if (normalized === OrderDetailStatus.Created) {
		return OrderDetailStatus.Preparing;
	}

	if (normalized === OrderDetailStatus.Preparing) {
		return OrderDetailStatus.Delivered;
	}

	return null;
};

export const canCancelFromPos = (status: string | undefined | null) => {
	return normalizeOrderDetailStatus(status) === OrderDetailStatus.Created;
};
