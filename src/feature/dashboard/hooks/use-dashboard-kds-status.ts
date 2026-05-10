import { useQuery } from "@tanstack/react-query";
import { normalizeCen } from "@/feature/sales/utils/cen";
import dashboardApi from "../api/dashboardApi";
import { extractDashboardApiError } from "./extract-dashboard-api-error";

export const useDashboardKdsStatus = (companyCen: string | null) => {
	const normalizedCompanyCen = normalizeCen(companyCen);
	const query = useQuery({
		queryKey: ["dashboard-kds-status", normalizedCompanyCen] as const,
		queryFn: async () => {
			return (await dashboardApi.getKdsStatus(normalizedCompanyCen ?? "")).data;
		},
		enabled: normalizedCompanyCen !== null,
	});

	return {
		kdsStatus: query.data ?? null,
		isLoadingKdsStatus: query.isLoading,
		isFetchingKdsStatus: query.isFetching,
		isErrorKdsStatus: query.isError,
		kdsStatusErrorMessage: extractDashboardApiError(query.error),
	};
};
