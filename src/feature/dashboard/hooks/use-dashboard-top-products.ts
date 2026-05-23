import { useQuery } from "@tanstack/react-query";
import { normalizeCen } from "@/feature/sales/utils/cen";
import dashboardApi from "../api/dashboardApi";
import type { TopProductDto } from "../types/dashboard";
import { extractDashboardApiError } from "./extract-dashboard-api-error";

export const useDashboardTopProducts = (companyCen: string | null, topN?: number) => {
	const normalizedCompanyCen = normalizeCen(companyCen);
	const query = useQuery({
		queryKey: ["dashboard-top-products", normalizedCompanyCen, topN] as const,
		queryFn: async () => {
			return (await dashboardApi.getTopProducts(normalizedCompanyCen ?? "", topN)).data;
		},
		enabled: normalizedCompanyCen !== null,
	});

	return {
		topProducts: query.data ?? ([] as TopProductDto[]),
		isLoadingTopProducts: query.isLoading,
		isFetchingTopProducts: query.isFetching,
		isErrorTopProducts: query.isError,
		topProductsErrorMessage: extractDashboardApiError(query.error),
	};
};
