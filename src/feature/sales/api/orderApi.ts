import apiClient from "@/api/apiClient";
import type { RestaurantOrder, CreateOrderRequest, CreateOrderResponse, AssignWaiter } from "../types/order";
import type { OrderItem } from "../types/order-detail";

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

const getOrderDetails = (restaurantOrderId: number) => {
	return apiClient.get<OrderItem[]>({
		url: `${SalesOrderApi.Order}/details/${restaurantOrderId}`
	})
}

const sendOrderToTeams = (restaurantOrderId: number) => {
	return apiClient.request<void>({
		url: `${SalesOrderApi.Order}/details/${restaurantOrderId}`,
		method: "PATCH"
	})
}

const getOrderTax = (restaurantOrderId: number) => {
	return apiClient.get<number>({
		url: `${SalesOrderApi.Order}/tax/${restaurantOrderId}`
	});
}

export default {
	createOrder,
	getDailyOrders,
	assignWaiter,
	getOrderDetails,
	sendOrderToTeams,
	getOrderTax
};