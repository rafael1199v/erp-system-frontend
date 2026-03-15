import apiClient from "@/api/apiClient";
import type { UpdateGlobalTaxRequest } from "../types/tax";

export enum SalesTaxApi {
	Tax = "/sales/tax",
}

const getGlobalTax = (companyId: number) => {
	return apiClient.get<number>({
		url: `${SalesTaxApi.Tax}/${companyId}`,
	});
};

const updateGlobalTax = (payload: UpdateGlobalTaxRequest) => {
	return apiClient.put<void>({
		url: SalesTaxApi.Tax,
		data: payload,
	});
};

export default {
	getGlobalTax,
	updateGlobalTax,
};
