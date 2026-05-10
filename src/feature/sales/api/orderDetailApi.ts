import apiClient from "@/api/apiClient";
import type {
	CreateTicketItemRequest,
	SalesCatalogProduct,
	SalesCatalogProductFilters,
	TicketItem,
	UpdateTicketItemRequest,
} from "../types/order-detail";

export enum SalesOrderDetailApi {
	Sales = "/sales",
}

const companySalesUrl = (companyCen: string) =>
	`${SalesOrderDetailApi.Sales}/companies/${encodeURIComponent(companyCen)}`;

const ticketItemsUrl = (companyCen: string, ticketCen: string) =>
	`${companySalesUrl(companyCen)}/tickets/${encodeURIComponent(ticketCen)}/items`;

const toQueryString = (filters?: SalesCatalogProductFilters) => {
	const params = new URLSearchParams();
	if (filters?.search) params.set("search", filters.search);
	if (filters?.categoryCen) params.set("categoryCen", filters.categoryCen);
	if (filters?.warehouseCen) params.set("warehouseCen", filters.warehouseCen);
	if (typeof filters?.onlyAvailable === "boolean") params.set("onlyAvailable", String(filters.onlyAvailable));
	if (filters?.page) params.set("page", String(filters.page));
	if (filters?.pageSize) params.set("pageSize", String(filters.pageSize));
	const queryString = params.toString();
	return queryString ? `?${queryString}` : "";
};

const getCatalogProducts = (companyCen: string, filters?: SalesCatalogProductFilters) => {
	return apiClient.get<SalesCatalogProduct[]>({
		url: `${companySalesUrl(companyCen)}/catalog/products${toQueryString(filters)}`,
	});
};

const createTicketItem = (companyCen: string, ticketCen: string, payload: CreateTicketItemRequest) => {
	return apiClient.post<TicketItem>({
		url: ticketItemsUrl(companyCen, ticketCen),
		data: payload,
	});
};

const updateTicketItem = (
	companyCen: string,
	ticketCen: string,
	ticketItemCen: string,
	payload: UpdateTicketItemRequest,
) => {
	return apiClient.patch<TicketItem>({
		url: `${ticketItemsUrl(companyCen, ticketCen)}/${encodeURIComponent(ticketItemCen)}`,
		data: payload,
	});
};

const resendTicketItem = (companyCen: string, ticketCen: string, ticketItemCen: string) => {
	return apiClient.post<TicketItem>({
		url: `${ticketItemsUrl(companyCen, ticketCen)}/${encodeURIComponent(ticketItemCen)}/resend`,
	});
};

export default {
	getCatalogProducts,
	createTicketItem,
	updateTicketItem,
	resendTicketItem,
};
