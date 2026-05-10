export type ProductContractStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";

export interface ProductCatalog {
	productCen: string;
	sku: string;
	name: string;
	description: string | null;
	categoryCen: string;
	categoryName: string;
	unitCen: string;
	unitName: string;
	salePrice: number;
	costPrice: number | null;
	reorderLevel: number;
	status: ProductContractStatus;
}

export interface ProductStock {
	productCen: string;
	productName: string;
	warehouseCen: string;
	warehouseName: string;
	availableQuantity: number;
	reservedQuantity: number;
	unitName: string;
	reorderLevel: number;
	isLowStock: boolean;
}

export type StockItem = ProductStock;

export interface CreateProduct {
	sku: string;
	name: string;
	description?: string | null;
	categoryCen: string;
	unitCen: string;
	salePrice: number;
	costPrice?: number | null;
	reorderLevel: number;
}

export interface UpdateProduct {
	sku: string;
	name: string;
	description?: string | null;
	categoryCen: string;
	unitCen: string;
	salePrice: number;
	costPrice?: number | null;
	reorderLevel: number;
}

export interface UpdateProductStatus {
	status: ProductContractStatus;
	reason?: string | null;
}

export type Product = ProductCatalog;
