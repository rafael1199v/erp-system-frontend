export interface UpdateStockForm {
	stock: number;
	reason: string;
}

export interface UpdateStockFormErrors {
	stockError: string | null;
	reasonError: string | null;
}
