export type PaymentTypeDto = {
	id: number;
	name: string;
};

export type ProcessRestaurantOrderPaymentDto = {
	restaurantOrderId: number;
	paymentTypeId: number;
};

export type ProcessRestaurantOrderPaymentSuccess = {
	saleId: number;
};

export type StockInsufficiencyResponseDto = {
	productId: number;
	productName: string;
	requestedQuantity: number;
	availableQuantity: number;
};

export type ProcessRestaurantOrderPaymentStockFailure = {
	isSuccess: false;
	saleId: null;
	message: string;
	insufficiencies: StockInsufficiencyResponseDto[];
};

export type BackendStringError = string;

export type ProcessPaymentApiError = BackendStringError | ProcessRestaurantOrderPaymentStockFailure;
