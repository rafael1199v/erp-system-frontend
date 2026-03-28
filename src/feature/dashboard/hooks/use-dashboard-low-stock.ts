import { useQuery } from "@tanstack/react-query";
import inventoryDashboardApi from "../api/inventoryDashboardApi";
import type { LowStockProductDto } from "../types/dashboard";
import { extractDashboardApiError } from "./extract-dashboard-api-error";

export const useDashboardLowStock = (companyId: number | null) => {
	const normalizedCompanyId = companyId ?? -1;
	const query = useQuery({
		queryKey: ["dashboard-low-stock", normalizedCompanyId] as const,
		queryFn: async () => {
			return (await inventoryDashboardApi.getLowStockProducts(normalizedCompanyId)).data;
		},
		enabled: normalizedCompanyId > 0,
	});

	return {
		lowStockProducts: query.data ?? ([] as LowStockProductDto[]),
		isLoadingLowStockProducts: query.isLoading,
		isFetchingLowStockProducts: query.isFetching,
		isErrorLowStockProducts: query.isError,
		lowStockErrorMessage: extractDashboardApiError(query.error),
	};
};
