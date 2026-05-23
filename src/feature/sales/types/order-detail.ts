import type { TicketLocationState } from "./order";

export type TicketItemStatus = "created" | "preparing" | "delivered" | "canceled" | "cancelled" | string;

export type SalesCatalogProduct = {
	productCen: string;
	name: string;
	categoryCen: string;
	categoryName: string;
	salePrice: number;
	availableQuantity: number;
	isAvailable: boolean;
	stationCode?: string | null;
};

export type SalesCatalogProductFilters = {
	search?: string;
	categoryCen?: string;
	warehouseCen?: string;
	onlyAvailable?: boolean;
	page?: number;
	pageSize?: number;
};

export type CreateTicketItemRequest = {
	productCen: string;
	quantity: number;
	note?: string | null;
};

export type UpdateTicketItemRequest = {
	quantity: number;
	note?: string | null;
};

export type UpdateTicketItemStatusRequest = {
	ticketItemCen: string;
	status: string;
};

export type TicketItem = {
	ticketItemCen: string;
	productCen: string;
	productName: string;
	quantity: number;
	unitPrice: number;
	note: string | null;
	status: TicketItemStatus;
	sentAt?: string | null;
	resendCount: number;
};

export type ProductDraftQuantity = Record<string, number>;

export type TicketItemsByCen = Map<string, TicketItem>;

export type OrderLocationState = TicketLocationState;
