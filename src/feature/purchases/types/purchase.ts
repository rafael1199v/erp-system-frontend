export type PurchaseOrderStatus = "Pending" | "Confirmed" | "Cancelled";

export type SupplierDto = {
	supplierCen: string;
	name: string;
};

export type PagedResult<T> = {
	items: T[];
	totalCount: number;
	totalPages: number;
	currentPage: number;
};

export type PurchaseOrderQuery = {
	status?: PurchaseOrderStatus;
	page?: number;
	pageSize?: number;
	sortDescending?: boolean;
};

export type PurchaseOrderListDto = {
	orderCen: string;
	status: PurchaseOrderStatus;
	createdAt: string;
	confirmedAt: string | null;
	supplierCen: string;
	itemCount: number;
};

export type CreatePurchaseOrderItemDto = {
	productCen: string;
	quantity: number;
};

export type CreatePurchaseOrderDto = {
	supplierCen: string;
	warehouseCen: string;
	items: CreatePurchaseOrderItemDto[];
};

export type PurchaseOrderSummaryDto = {
	orderCen: string;
	status: PurchaseOrderStatus;
};

export type PurchaseOrderDetailItemDto = {
	productCen: string;
	quantity: number;
};

export type PurchaseOrderDetailDto = {
	orderCen: string;
	status: PurchaseOrderStatus;
	createdAt: string;
	confirmedAt: string | null;
	supplierCen: string;
	warehouseCen: string;
	items: PurchaseOrderDetailItemDto[];
};

export type PurchaseOrderConfirmationDto = {
	orderCen: string;
	status: "Confirmed";
	confirmedAt: string;
};
