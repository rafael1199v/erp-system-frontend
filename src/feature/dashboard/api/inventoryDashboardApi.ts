import apiClient from "@/api/apiClient";
import type { LowStockProductDto } from "../types/dashboard";

export enum InventoryDashboardApi {
	Dashboard = "/inventory/dashboard",
}

const getLowStockProducts = (companyId: number) => {
	return apiClient.get<LowStockProductDto[]>({
		url: `${InventoryDashboardApi.Dashboard}/${companyId}/low-stock`,
	});
};

export default {
	getLowStockProducts,
};
