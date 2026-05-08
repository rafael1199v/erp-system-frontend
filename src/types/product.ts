import type { WarehouseWithStock } from "./warehouse";

export interface ProductCatalog {
	productId: number;
	productName: string;
	unit: number;
	currentCost: number;
	imageUrl: string | null;
	categoryId: number;
	categoryName: string;
	statusCode: number;
	isActive: boolean;
}

export interface ProductStock {
	productId: number;
	productName: string;
	unit: string;
	currentCost: number;
	totalStock: number;
	imageUrl: string | null;
}

export interface ProductWithWarehouses {
	product: ProductCatalog;
	warehouses: WarehouseWithStock[];
}

export interface CreateProduct {
	name: string;
	imageUrl: string | null;
	unitId: number;
	companyId: number;
	productStatusId: number;
	supplierId: number;
	categoryId: number;
	currentCost: number;
	reorderLevel: number;
	sellPrice: number;
}

export interface UpdateProduct {
	productId: number;
	name: string;
	imageUrl: string | null;
	unitId: number;
	companyId: number;
	productStatusId: number;
	supplierId: number;
	categoryId: number;
	currentCost: number;
	reorderLevel: number;
	sellPrice: number;
}

export interface Product {
	id: number;
	name: string;
	imageUrl: string | null;
	unitId: number;
	companyId: number;
	productStatusId: number;
	supplierId: number;
	categoryId: number;
	currentCost: number;
	reorderLevel: number;
	sellPrice: number;
}
