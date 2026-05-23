import apiClient from "@/api/apiClient";
import type { KdsStatusUpdateResponse, KdsTeam, KdsTeamItem, UpdateKdsItemStatusRequest } from "../types/kds";

export enum SalesKdsApi {
	Sales = "/sales",
}

const companyKdsUrl = (companyCen: string) => `${SalesKdsApi.Sales}/companies/${encodeURIComponent(companyCen)}/kds`;

const getTeamsByCompany = (companyCen: string) => {
	return apiClient.get<KdsTeam[]>({
		url: `${companyKdsUrl(companyCen)}/teams`,
	});
};

const getTeamItems = (companyCen: string, teamCen: string) => {
	return apiClient.get<KdsTeamItem[]>({
		url: `${companyKdsUrl(companyCen)}/teams/${encodeURIComponent(teamCen)}/items`,
	});
};

const updateTicketItemStatus = (companyCen: string, ticketItemCen: string, payload: UpdateKdsItemStatusRequest) => {
	return apiClient.patch<KdsStatusUpdateResponse>({
		url: `${companyKdsUrl(companyCen)}/items/${encodeURIComponent(ticketItemCen)}/status`,
		data: payload,
	});
};

export default {
	getTeamsByCompany,
	getTeamItems,
	updateTicketItemStatus,
};
