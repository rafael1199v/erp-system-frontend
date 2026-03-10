import apiClient from "../apiClient";

import type { Company } from "#/company";
import type { ProductStock } from "@/types/product";

export enum CompanyApi {
  Company = "/company",
}

const getCompanies = () => {
  return apiClient.get<Company[]>({
    url: CompanyApi.Company
  });
}

const getProductStock = (companyId: string) => {
  return apiClient.get<ProductStock[]>({
    url: `${CompanyApi.Company}/${companyId}/products/stock`
  })
}


export default {
  getCompanies,
  getProductStock
};