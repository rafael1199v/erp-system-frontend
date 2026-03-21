import apiClient from "@/api/apiClient";
import type { KdsTeam, KdsTeamItem } from "../types/kds";

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

export default {
	getTeamsByCompany,
	getTeamItems,
};
