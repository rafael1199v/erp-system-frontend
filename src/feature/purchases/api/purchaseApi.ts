import apiClient from "@/api/apiClient";
import type {
	CreatePurchaseOrderDto,
	PagedResult,
	PurchaseOrderConfirmationDto,
	PurchaseOrderDetailDto,
	PurchaseOrderListDto,
	PurchaseOrderQuery,
	PurchaseOrderSummaryDto,
	SupplierDto,
} from "../types/purchase";

const purchasesCompanyUrl = (companyCen: string) => `/purchases/companies/${encodeURIComponent(companyCen)}`;
const purchaseOrdersUrl = (companyCen: string) => `${purchasesCompanyUrl(companyCen)}/orders`;
const purchaseOrderUrl = (companyCen: string, orderCen: string) =>
	`${purchaseOrdersUrl(companyCen)}/${encodeURIComponent(orderCen)}`;

const toQueryString = (query?: PurchaseOrderQuery) => {
	const params = new URLSearchParams();

	if (query?.status) params.set("status", query.status);
	if (query?.page) params.set("page", String(query.page));
	if (query?.pageSize) params.set("pageSize", String(query.pageSize));
	if (typeof query?.sortDescending === "boolean") params.set("sortDescending", String(query.sortDescending));

	const value = params.toString();
	return value ? `?${value}` : "";
};

const getSuppliers = (companyCen: string) => {
	return apiClient.get<SupplierDto[]>({
		url: `/purchases/companies/${encodeURIComponent(companyCen)}/suppliers`,
	});
};

const getOrders = (companyCen: string, query?: PurchaseOrderQuery) => {
	return apiClient.get<PagedResult<PurchaseOrderListDto>>({
		url: `${purchaseOrdersUrl(companyCen)}${toQueryString(query)}`,
	});
};

const createOrder = (companyCen: string, payload: CreatePurchaseOrderDto) => {
	return apiClient.post<PurchaseOrderSummaryDto>({
		url: purchaseOrdersUrl(companyCen),
		data: payload,
	});
};

const getOrder = (companyCen: string, orderCen: string) => {
	return apiClient.get<PurchaseOrderDetailDto>({
		url: purchaseOrderUrl(companyCen, orderCen),
	});
};

const confirmOrder = (companyCen: string, orderCen: string) => {
	return apiClient.post<PurchaseOrderConfirmationDto>({
		url: `${purchaseOrderUrl(companyCen, orderCen)}/confirm`,
	});
};

export default {
	getSuppliers,
	getOrders,
	createOrder,
	getOrder,
	confirmOrder,
};
