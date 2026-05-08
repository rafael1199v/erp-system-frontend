import apiClient from "@/api/apiClient";
import type { KdsTeam, KdsTeamItem } from "../types/kds";
import type { UpdateOrderDetailStatusRequest } from "../types/order-detail";

export enum SalesKdsApi {
	Kds = "/sales/kds",
}

const getTeamsByCompany = (companyId: number) => {
	return apiClient.get<KdsTeam[]>({
		url: `${SalesKdsApi.Kds}/${companyId}/teams`,
	});
};

const getTeamItems = (companyId: number, teamId: number) => {
	return apiClient.get<KdsTeamItem[]>({
		url: `${SalesKdsApi.Kds}/${companyId}/teams/${teamId}/items`,
	});
};

const updateRestaurantOrderDetailStatus = (payload: UpdateOrderDetailStatusRequest) => {
	return apiClient.request<void>({
		url: `${SalesKdsApi.Kds}/restaurant-order-detail`,
		method: "PATCH",
		data: payload,
	});
};

export default {
	getTeamsByCompany,
	getTeamItems,
	updateRestaurantOrderDetailStatus,
};
