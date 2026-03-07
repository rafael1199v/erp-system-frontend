import apiClient from "../apiClient";

import { ProductCatalog, ProductWithWarehouses } from "@/types/product";

export enum ProductApi {
  Company = "/company",
  Product = "/product"
}

const getProductCatalog = (companyId: string) => {
    return apiClient.get<ProductCatalog[]>({
        url: `${ProductApi.Company}/${companyId}/products`
    });
}

const getProductsWithWarehouses = (companyId: string) => {
    return apiClient.get<ProductWithWarehouses[]>({
        url: `${ProductApi.Product}/stock/warehouses/${companyId}`
    })
}

export default {
    getProductCatalog,
    getProductsWithWarehouses
}