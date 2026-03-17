import apiClient from "@/api/apiClient";
import type { RestaurantOrder, CreateOrderRequest, CreateOrderResponse, AssignWaiter } from "../types/order";

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

const assignWaiter = (assignWaiterRequest: AssignWaiter) => {
	return apiClient.put<void>({
		url: `${SalesOrderApi.Order}/assign`,
		data: assignWaiterRequest
	});
}

export default {
	createOrder,
	getDailyOrders,
	assignWaiter
};