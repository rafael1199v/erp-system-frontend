import type { WarehouseWithStock } from "./warehouse";

export interface ProductCatalog {
    productId: number,
    productName: string,
    unit: number,
    currentCost: number,
    imageUrl: string | null,
    categoryId: number,
    categoryName: string,
    statusCode: number
}

export interface ProductStock {
    productId: number;
    productName: string,
    unit: string,
    currentCost: number,
    totalStock: number,
    imageUrl: string | null
}

export interface ProductWithWarehouses {
    product: ProductCatalog;
    warehouses: WarehouseWithStock[];
}

