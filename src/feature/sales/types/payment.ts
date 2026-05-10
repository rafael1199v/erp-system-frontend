export type PaymentMethodDto = {
	paymentMethodCode: string;
	name: string;
	isActive: boolean;
};

export type ProcessTicketPaymentDto = {
	paymentMethodCode: string;
};

export type ProcessTicketPaymentSuccess = {
	saleCen: string;
	ticketCen: string;
	status: "Paid" | string;
	subtotal: number;
	taxAmount: number;
	total: number;
	inventoryDocumentCen?: string | null;
};

export type StockInsufficiencyResponseDto = {
	productId?: 0;
	productCen?: string | null;
	productName: string;
	warehouseCen?: string | null;
	requestedQuantity: number;
	availableQuantity: number;
	missingQuantity: number;
};

export type ProcessTicketPaymentStockFailure = {
	isSuccess: false;
	saleCen?: string | null;
	inventoryDocumentCen?: string | null;
	subtotal?: number;
	taxAmount?: number;
	total?: number;
	message?: string | null;
	insufficiencies?: StockInsufficiencyResponseDto[];
	requirements?: StockInsufficiencyResponseDto[];
};

export type BackendStringError = string;

export type ProcessPaymentApiError = BackendStringError | ProcessTicketPaymentStockFailure;
