import type {
	CreateProduct,
	Product,
	ProductCatalog,
	ProductContractStatus,
	StockItem,
	UpdateProduct,
} from "@/types/product";
import apiClient from "../apiClient";

export enum ProductApi {
	Inventory = "/inventory",
}

type ProductFilters = {
	search?: string;
	categoryCen?: string;
	status?: ProductContractStatus;
};

const toQueryString = (filters?: ProductFilters) => {
	const params = new URLSearchParams();
	if (filters?.search) params.set("search", filters.search);
	if (filters?.categoryCen) params.set("categoryCen", filters.categoryCen);
	if (filters?.status) params.set("status", filters.status);
	const queryString = params.toString();
	return queryString ? `?${queryString}` : "";
};

const getProductCatalog = (companyCen: string, filters?: ProductFilters) => {
	return apiClient.get<ProductCatalog[]>({
		url: `${ProductApi.Inventory}/companies/${encodeURIComponent(companyCen)}/products${toQueryString(filters)}`,
	});
};

const getStock = (companyCen: string) => {
	return apiClient.get<StockItem[]>({
		url: `${ProductApi.Inventory}/companies/${encodeURIComponent(companyCen)}/stock`,
	});
};

const createProduct = (companyCen: string, product: CreateProduct) => {
	return apiClient.post<Product>({
		url: `${ProductApi.Inventory}/companies/${encodeURIComponent(companyCen)}/products`,
		data: product,
	});
};

const saveProduct = (companyCen: string, productCen: string, product: UpdateProduct) => {
	return apiClient.put<Product>({
		url: `${ProductApi.Inventory}/companies/${encodeURIComponent(companyCen)}/products/${encodeURIComponent(productCen)}`,
		data: product,
	});
};

const updateProductStatus = (
	companyCen: string,
	productCen: string,
	status: ProductContractStatus,
	reason?: string,
) => {
	return apiClient.patch<Product>({
		url: `${ProductApi.Inventory}/companies/${encodeURIComponent(companyCen)}/products/${encodeURIComponent(productCen)}/status`,
		data: {
			status,
			reason: reason ?? null,
		},
	});
};

const activateProduct = (companyCen: string, productCen: string) =>
	updateProductStatus(companyCen, productCen, "ACTIVE");

const deactivateProduct = (companyCen: string, productCen: string) =>
	updateProductStatus(companyCen, productCen, "INACTIVE");

export default {
	getProductCatalog,
	getStock,
	createProduct,
	updateProduct: saveProduct,
	activateProduct,
	deactivateProduct,
	updateProductStatus,
};
