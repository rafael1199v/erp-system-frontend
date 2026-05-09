import type { Company, InventoryDashboard } from "#/company";
import apiClient from "../apiClient";

export enum CompanyApi {
	Inventory = "/inventory",
}

const getCompanies = () => {
	return apiClient.get<Company[]>({
		url: `${CompanyApi.Inventory}/companies`,
	});
};

const getInventoryDashboard = (companyCen: string) => {
	return apiClient.get<InventoryDashboard>({
		url: `${CompanyApi.Inventory}/companies/${encodeURIComponent(companyCen)}/dashboard`,
	});
};

export default {
	getCompanies,
	getInventoryDashboard,
};
