import { keepPreviousData, useQuery } from "@tanstack/react-query";
import inventoryLookupApi from "../api/inventoryLookupApi";
import purchaseApi from "../api/purchaseApi";
import type { ProductQuery } from "../types/inventory";
import { normalizeCen } from "../utils/cen";

export const usePurchaseSuppliers = (companyCen: string | null) => {
	const normalizedCompanyCen = normalizeCen(companyCen);

	return useQuery({
		queryKey: ["purchase-suppliers", normalizedCompanyCen],
		queryFn: async () => {
			const response = await purchaseApi.getSuppliers(normalizedCompanyCen ?? "");
			return response.data;
		},
		enabled: normalizedCompanyCen !== null,
	});
};

export const usePurchaseWarehouses = (companyCen: string | null) => {
	const normalizedCompanyCen = normalizeCen(companyCen);

	return useQuery({
		queryKey: ["purchase-warehouses", normalizedCompanyCen],
		queryFn: async () => {
			const response = await inventoryLookupApi.getWarehouses(normalizedCompanyCen ?? "");
			return response.data;
		},
		enabled: normalizedCompanyCen !== null,
	});
};

export const usePurchaseProducts = (companyCen: string | null, filters?: ProductQuery) => {
	const normalizedCompanyCen = normalizeCen(companyCen);

	return useQuery({
		queryKey: ["purchase-products", normalizedCompanyCen, filters],
		queryFn: async () => {
			const response = await inventoryLookupApi.getProducts(normalizedCompanyCen ?? "", filters);
			return response.data;
		},
		enabled: normalizedCompanyCen !== null,
		placeholderData: keepPreviousData,
	});
};
