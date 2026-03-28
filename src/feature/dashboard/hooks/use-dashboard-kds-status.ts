import { useQuery } from "@tanstack/react-query";
import dashboardApi from "../api/dashboardApi";
import { extractDashboardApiError } from "./extract-dashboard-api-error";

export const useDashboardKdsStatus = (companyId: number | null) => {
	const normalizedCompanyId = companyId ?? -1;
	const query = useQuery({
		queryKey: ["dashboard-kds-status", normalizedCompanyId] as const,
		queryFn: async () => {
			return (await dashboardApi.getKdsStatus(normalizedCompanyId)).data;
		},
		enabled: normalizedCompanyId > 0,
	});

	return {
		kdsStatus: query.data ?? null,
		isLoadingKdsStatus: query.isLoading,
		isFetchingKdsStatus: query.isFetching,
		isErrorKdsStatus: query.isError,
		kdsStatusErrorMessage: extractDashboardApiError(query.error),
	};
};
