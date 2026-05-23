import { useQuery } from "@tanstack/react-query";
import dashboardApi from "../api/dashboardApi";
import { extractDashboardApiError } from "./extract-dashboard-api-error";
import { normalizeCen } from "@/feature/sales/utils/cen";

export const useDashboardDailySales = (companyCen: string | null) => {
	const normalizedCompanyCen = normalizeCen(companyCen);
	const query = useQuery({
		queryKey: ["dashboard-daily-sales", normalizedCompanyCen] as const,
		queryFn: async () => {
			return (await dashboardApi.getDailySales(normalizedCompanyCen ?? "")).data;
		},
		enabled: normalizedCompanyCen !== null,
	});

	return {
		dailySales: query.data ?? null,
		isLoadingDailySales: query.isLoading,
		isFetchingDailySales: query.isFetching,
		isErrorDailySales: query.isError,
		dailySalesErrorMessage: extractDashboardApiError(query.error),
	};
};
