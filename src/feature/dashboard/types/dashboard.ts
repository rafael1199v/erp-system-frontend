export type BackendStringError = string;

export type DailySalesSummaryDto = {
	totalSales: number;
	ticketsCount: number;
	averageTicket: number;
};

export type TopProductDto = {
	productId: number;
	productName: string;
	totalQuantity: number;
	categoryId: number;
	sellPrice: number;
};

export type KdsStatusCountersDto = {
	pendingCount: number;
	preparingCount: number;
	readyCount: number;
};

export type LowStockState = "OutOfStock" | "LowStock";

export type LowStockProductDto = {
	productId: number;
	productName: string;
	totalStock: number;
	reorderLevel: number;
	stockState: LowStockState | string;
};
