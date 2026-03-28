import apiClient from "@/api/apiClient";
import type { DailySalesSummaryDto, KdsStatusCountersDto, TopProductDto } from "../types/dashboard";

export enum SalesDashboardApi {
	Dashboard = "/sales/dashboard",
}

const getDailySales = (companyId: number) => {
	return apiClient.get<DailySalesSummaryDto>({
		url: `${SalesDashboardApi.Dashboard}/${companyId}/daily-sales`,
	});
};

const getTopProducts = (companyId: number) => {
	return apiClient.get<TopProductDto[]>({
		url: `${SalesDashboardApi.Dashboard}/${companyId}/top-products`,
	});
};

const getKdsStatus = (companyId: number) => {
	return apiClient.get<KdsStatusCountersDto>({
		url: `${SalesDashboardApi.Dashboard}/${companyId}/kds-status`,
	});
};

export default {
	getDailySales,
	getTopProducts,
	getKdsStatus,
};
