import apiClient from "@/api/apiClient";
import type { RestaurantOrder, CreateOrderRequest, CreateOrderResponse } from "../types/order";

export enum SalesOrderApi {
	Order = "/sales/order",
}

const createOrder = (payload: CreateOrderRequest) => {
	return apiClient.post<CreateOrderResponse>({
		url: SalesOrderApi.Order,
		data: payload,
	});
};

const getDailyOrders = (companyId: number) => {
	return apiClient.get<RestaurantOrder[]>({
		url: `${SalesOrderApi.Order}/${companyId}`
	})
}

export default {
	createOrder,
	getDailyOrders
};