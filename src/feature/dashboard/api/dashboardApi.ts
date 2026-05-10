import apiClient from "@/api/apiClient";
import type { DailySalesSummaryDto, KdsStatusCountersDto, TopProductDto } from "../types/dashboard";

export enum SalesDashboardApi {
	Sales = "/sales",
}

const companyDashboardUrl = (companyCen: string) =>
	`${SalesDashboardApi.Sales}/companies/${encodeURIComponent(companyCen)}/dashboard`;

const getDailySales = (companyCen: string) => {
	return apiClient.get<DailySalesSummaryDto>({
		url: `${companyDashboardUrl(companyCen)}/daily-sales`,
	});
};

const getTopProducts = (companyCen: string, topN?: number) => {
	const params = new URLSearchParams();
	if (topN !== undefined) params.set("topN", String(topN));
	const queryString = params.toString();

	return apiClient.get<TopProductDto[]>({
		url: `${companyDashboardUrl(companyCen)}/top-products${queryString ? `?${queryString}` : ""}`,
	});
};

const getKdsStatus = (companyCen: string) => {
	return apiClient.get<KdsStatusCountersDto>({
		url: `${companyDashboardUrl(companyCen)}/kds-status`,
	});
};

export default {
	getDailySales,
	getTopProducts,
	getKdsStatus,
};
