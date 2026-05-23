import apiClient from "@/api/apiClient";
import type { InventoryDashboardDto, InventoryStockItemDto } from "../types/dashboard";

export enum InventoryDashboardApi {
	Inventory = "/inventory",
}

const companyInventoryUrl = (companyCen: string) =>
	`${InventoryDashboardApi.Inventory}/companies/${encodeURIComponent(companyCen)}`;

const getInventoryDashboard = (companyCen: string) => {
	return apiClient.get<InventoryDashboardDto>({
		url: `${companyInventoryUrl(companyCen)}/dashboard`,
	});
};

const getStockItems = (companyCen: string) => {
	return apiClient.get<InventoryStockItemDto[]>({
		url: `${companyInventoryUrl(companyCen)}/stock`,
	});
};

export default {
	getInventoryDashboard,
	getStockItems,
};
