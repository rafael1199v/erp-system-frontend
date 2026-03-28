import apiClient from "@/api/apiClient";
import type {
	PaymentTypeDto,
	ProcessRestaurantOrderPaymentDto,
	ProcessRestaurantOrderPaymentSuccess,
} from "../types/payment";

export enum SalesPaymentApi {
	Methods = "/sales/payment/methods",
	Process = "/sales/payment/process",
}

const getPaymentMethods = () => {
	return apiClient.get<PaymentTypeDto[]>({
		url: SalesPaymentApi.Methods,
	});
};

const processPayment = (payload: ProcessRestaurantOrderPaymentDto) => {
	return apiClient.post<ProcessRestaurantOrderPaymentSuccess>({
		url: SalesPaymentApi.Process,
		data: payload,
	});
};

export default {
	getPaymentMethods,
	processPayment,
};
