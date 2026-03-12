import apiClient from "../apiClient";

import type { CreateProduct, ProductCatalog, ProductWithWarehouses } from "@/types/product";

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

const createProduct = (product: CreateProduct) => {
    return apiClient.post<void>({
        url: `${ProductApi.Product}`,
        data: product
    });
}

export default {
    getProductCatalog,
    getProductsWithWarehouses,
    createProduct
}