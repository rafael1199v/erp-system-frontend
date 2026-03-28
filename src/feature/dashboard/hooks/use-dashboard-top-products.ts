import { useQuery } from "@tanstack/react-query";
import dashboardApi from "../api/dashboardApi";
import type { TopProductDto } from "../types/dashboard";
import { extractDashboardApiError } from "./extract-dashboard-api-error";

export const useDashboardTopProducts = (companyId: number | null) => {
	const normalizedCompanyId = companyId ?? -1;
	const query = useQuery({
		queryKey: ["dashboard-top-products", normalizedCompanyId] as const,
		queryFn: async () => {
			return (await dashboardApi.getTopProducts(normalizedCompanyId)).data;
		},
		enabled: normalizedCompanyId > 0,
	});

	return {
		topProducts: query.data ?? ([] as TopProductDto[]),
		isLoadingTopProducts: query.isLoading,
		isFetchingTopProducts: query.isFetching,
		isErrorTopProducts: query.isError,
		topProductsErrorMessage: extractDashboardApiError(query.error),
	};
};
