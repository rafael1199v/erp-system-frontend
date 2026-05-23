export type BackendStringError = string;

export type DailySalesSummaryDto = {
	totalSales: number;
	ticketsCount: number;
	averageTicket: number;
};

export type TopProductDto = {
	productCen?: string | null;
	productName: string;
	totalQuantity: number;
	categoryCen?: string | null;
	categoryName?: string | null;
	salePrice: number;
};

export type KdsStatusCountersDto = {
	pendingCount?: number;
	preparingCount?: number;
	readyCount?: number;
	deliveredCount?: number;
	canceledCount?: number;
	[key: string]: number | undefined;
};

export type InventoryDashboardDto = {
	companyCen: string;
	totalProducts: number;
	totalStockQuantity: number;
	lowStockCount: number;
	outOfStockCount: number;
};

export type InventoryStockItemDto = {
	productCen: string;
	productName: string;
	warehouseCen: string;
	warehouseName: string;
	availableQuantity: number;
	reservedQuantity: number;
	unitName: string;
	reorderLevel: number;
	isLowStock: boolean;
};

export type CriticalStockProductDto = InventoryStockItemDto & {
	stockState: "OUT_OF_STOCK" | "LOW_STOCK";
};

export type LowStockProductDto = CriticalStockProductDto;
