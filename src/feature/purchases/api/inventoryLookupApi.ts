import apiClient from "@/api/apiClient";
import type {
	ProductContractDto,
	ProductLookupContractRequest,
	ProductQuery,
	WarehouseContractDto,
} from "../types/inventory";

const inventoryCompanyUrl = (companyCen: string) => `/inventory/companies/${encodeURIComponent(companyCen)}`;

const toQueryString = (query?: ProductQuery) => {
	const params = new URLSearchParams();

	if (query?.search) params.set("search", query.search);
	if (query?.categoryCen) params.set("categoryCen", query.categoryCen);
	if (query?.status) params.set("status", query.status);

	const value = params.toString();
	return value ? `?${value}` : "";
};

const getProducts = (companyCen: string, query?: ProductQuery) => {
	return apiClient.get<ProductContractDto[]>({
		url: `${inventoryCompanyUrl(companyCen)}/products${toQueryString(query)}`,
	});
};

const lookupProducts = (companyCen: string, payload: ProductLookupContractRequest) => {
	return apiClient.post<ProductContractDto[]>({
		url: `${inventoryCompanyUrl(companyCen)}/products/lookup`,
		data: payload,
	});
};

const getWarehouses = (companyCen: string) => {
	return apiClient.get<WarehouseContractDto[]>({
		url: `${inventoryCompanyUrl(companyCen)}/warehouses`,
	});
};

export default {
	getProducts,
	lookupProducts,
	getWarehouses,
};
