export interface Company {
	companyCen: string;
	name: string;
	isActive: boolean;
}

export interface InventoryDashboard {
	companyCen: string;
	totalProducts: number;
	totalStockQuantity: number;
	lowStockCount: number;
	outOfStockCount: number;
}
