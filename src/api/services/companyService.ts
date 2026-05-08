import type { Company } from "#/company";
import type { ProductStock } from "@/types/product";
import apiClient from "../apiClient";

export enum CompanyApi {
	Company = "/inventory/company",
}

const getCompanies = () => {
	return apiClient.get<Company[]>({
		url: CompanyApi.Company,
	});
};

const getProductStock = (companyId: string) => {
	return apiClient.get<ProductStock[]>({
		url: `${CompanyApi.Company}/${companyId}/products/stock`,
	});
};

export default {
	getCompanies,
	getProductStock,
};
