export enum OrderDetailStatus {
	Created = 1,
	Preparing = 2,
	Delivered = 3,
	Canceled = 4,
}

export const ORDER_DETAIL_STATUS_LABELS: Record<OrderDetailStatus, string> = {
	[OrderDetailStatus.Created]: "Pendiente",
	[OrderDetailStatus.Preparing]: "En preparacion",
	[OrderDetailStatus.Delivered]: "Listo",
	[OrderDetailStatus.Canceled]: "Cancelado",
};

export const getOrderDetailStatusLabel = (statusId: number, fallbackLabel?: string) => {
	if (statusId in ORDER_DETAIL_STATUS_LABELS) {
		return ORDER_DETAIL_STATUS_LABELS[statusId as OrderDetailStatus];
	}

	return fallbackLabel ?? "Desconocido";
};

export const canAdvanceKdsStatus = (statusId: number) => {
	return statusId === OrderDetailStatus.Created || statusId === OrderDetailStatus.Preparing;
};

export const getNextKdsStatus = (statusId: number): OrderDetailStatus | null => {
	if (statusId === OrderDetailStatus.Created) {
		return OrderDetailStatus.Preparing;
	}

	if (statusId === OrderDetailStatus.Preparing) {
		return OrderDetailStatus.Delivered;
	}

	return null;
};

export const canCancelFromPos = (statusId: number) => {
	return statusId === OrderDetailStatus.Created;
};
