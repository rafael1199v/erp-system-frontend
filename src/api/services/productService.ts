import apiClient from "../apiClient";

import type { CreateProduct, Product, ProductCatalog, ProductWithWarehouses, UpdateProduct } from "@/types/product";

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

const getProductWithCompany = (productId: number) => {
    return apiClient.get<Product>({
        url: `${ProductApi.Product}/with-company/${productId}`
    });
}

const updateProduct = (product: UpdateProduct) => {
    return apiClient.put<void>({
        url: `${ProductApi.Product}`,
        data: product
    })
}

const activateProduct = (productId: number, companyId: number) => {
    return apiClient.post<void>({
        url: `${ProductApi.Product}/activate`,
        data: {
            productId: productId,
            companyId: companyId
        }
    })
}

const deactivateProduct = (productId: number, companyId: number) => {
    return apiClient.post<void>({
        url: `${ProductApi.Product}/deactivate`,
        data: {
            productId: productId,
            companyId: companyId
        }
    })
}

export default {
    getProductCatalog,
    getProductsWithWarehouses,
    createProduct,
    getProductWithCompany,
    updateProduct,
    activateProduct,
    deactivateProduct
}