import { useQuery } from "@tanstack/react-query";
import { normalizeCen } from "@/feature/sales/utils/cen";
import inventoryDashboardApi from "../api/inventoryDashboardApi";
import type { InventoryStockItemDto, LowStockProductDto } from "../types/dashboard";
import { extractDashboardApiError } from "./extract-dashboard-api-error";

const toCriticalStockProducts = (items: InventoryStockItemDto[]): LowStockProductDto[] => {
	return items
		.filter((item) => item.availableQuantity <= 0 || item.isLowStock)
		.map((item) => ({
			...item,
			stockState: item.availableQuantity <= 0 ? ("OUT_OF_STOCK" as const) : ("LOW_STOCK" as const),
		}));
};

export const useDashboardLowStock = (companyCen: string | null) => {
	const normalizedCompanyCen = normalizeCen(companyCen);
	const query = useQuery({
		queryKey: ["dashboard-low-stock", normalizedCompanyCen] as const,
		queryFn: async () => {
			const response = await inventoryDashboardApi.getStockItems(normalizedCompanyCen ?? "");
			return toCriticalStockProducts(response.data);
		},
		enabled: normalizedCompanyCen !== null,
	});

	return {
		lowStockProducts: query.data ?? ([] as LowStockProductDto[]),
		isLoadingLowStockProducts: query.isLoading,
		isFetchingLowStockProducts: query.isFetching,
		isErrorLowStockProducts: query.isError,
		lowStockErrorMessage: extractDashboardApiError(query.error),
	};
};
