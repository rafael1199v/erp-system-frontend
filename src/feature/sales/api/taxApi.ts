import apiClient from "@/api/apiClient";
import type { TaxConfiguration, UpdateGlobalTaxRequest } from "../types/tax";

export enum SalesTaxApi {
	Sales = "/sales",
}

const taxConfigurationUrl = (companyCen: string) =>
	`${SalesTaxApi.Sales}/companies/${encodeURIComponent(companyCen)}/tax-configuration`;

const getGlobalTax = (companyCen: string) => {
	return apiClient.get<TaxConfiguration>({
		url: taxConfigurationUrl(companyCen),
	});
};

const updateGlobalTax = (companyCen: string, payload: UpdateGlobalTaxRequest) => {
	return apiClient.put<TaxConfiguration>({
		url: taxConfigurationUrl(companyCen),
		data: payload,
	});
};

export default {
	getGlobalTax,
	updateGlobalTax,
};
