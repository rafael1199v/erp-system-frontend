import { useQuery } from "@tanstack/react-query";
import { normalizeCen } from "@/feature/sales/utils/cen";
import inventoryDashboardApi from "../api/inventoryDashboardApi";
import { extractDashboardApiError } from "./extract-dashboard-api-error";

export const useDashboardInventorySummary = (companyCen: string | null) => {
	const normalizedCompanyCen = normalizeCen(companyCen);
	const query = useQuery({
		queryKey: ["dashboard-inventory-summary", normalizedCompanyCen] as const,
		queryFn: async () => {
			return (await inventoryDashboardApi.getInventoryDashboard(normalizedCompanyCen ?? "")).data;
		},
		enabled: normalizedCompanyCen !== null,
	});

	return {
		inventorySummary: query.data ?? null,
		isLoadingInventorySummary: query.isLoading,
		isFetchingInventorySummary: query.isFetching,
		isErrorInventorySummary: query.isError,
		inventorySummaryErrorMessage: extractDashboardApiError(query.error),
	};
};
