import apiClient from "@/api/apiClient";
import type { PaymentMethodDto, ProcessTicketPaymentDto, ProcessTicketPaymentSuccess } from "../types/payment";

export enum SalesPaymentApi {
	Methods = "/sales/payment-methods",
	Sales = "/sales",
}

const getPaymentMethods = () => {
	return apiClient.get<PaymentMethodDto[]>({
		url: SalesPaymentApi.Methods,
	});
};

const processPayment = (companyCen: string, ticketCen: string, payload: ProcessTicketPaymentDto) => {
	return apiClient.post<ProcessTicketPaymentSuccess>({
		url: `${SalesPaymentApi.Sales}/companies/${encodeURIComponent(companyCen)}/tickets/${encodeURIComponent(ticketCen)}/payment`,
		data: payload,
	});
};

export default {
	getPaymentMethods,
	processPayment,
};
