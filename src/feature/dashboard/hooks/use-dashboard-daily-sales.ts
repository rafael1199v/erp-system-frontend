import { useQuery } from "@tanstack/react-query";
import dashboardApi from "../api/dashboardApi";
import { extractDashboardApiError } from "./extract-dashboard-api-error";

export const useDashboardDailySales = (companyId: number | null) => {
	const normalizedCompanyId = companyId ?? -1;
	const query = useQuery({
		queryKey: ["dashboard-daily-sales", normalizedCompanyId] as const,
		queryFn: async () => {
			return (await dashboardApi.getDailySales(normalizedCompanyId)).data;
		},
		enabled: normalizedCompanyId > 0,
	});

	return {
		dailySales: query.data ?? null,
		isLoadingDailySales: query.isLoading,
		isFetchingDailySales: query.isFetching,
		isErrorDailySales: query.isError,
		dailySalesErrorMessage: extractDashboardApiError(query.error),
	};
};
