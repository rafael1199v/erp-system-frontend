import apiClient from "@/api/apiClient";
import type { CreateOrderRequest, CreateOrderResponse } from "../types/order";

export enum SalesOrderApi {
	Order = "/sales/order",
}

const createOrder = (payload: CreateOrderRequest) => {
	return apiClient.post<CreateOrderResponse>({
		url: SalesOrderApi.Order,
		data: payload,
	});
};

export default {
	createOrder,
};