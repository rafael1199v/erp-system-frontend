import apiClient from "@/api/apiClient";
import type {
	AvailableOrderProduct,
	CreateOrderDetailRequest,
	CreateOrderDetailResponse,
	UpdateOrderDetailQuantityRequest,
} from "../types/order-detail";

export enum SalesOrderDetailApi {
	OrderDetail = "/sales/order-detail",
}

const getProductsByRestaurantOrder = (restaurantOrderId: number) => {
	return apiClient.get<AvailableOrderProduct[]>({
		url: `${SalesOrderDetailApi.OrderDetail}/products/${restaurantOrderId}`,
	});
};

const createOrderDetail = (payload: CreateOrderDetailRequest) => {
	return apiClient.post<CreateOrderDetailResponse>({
		url: SalesOrderDetailApi.OrderDetail,
		data: payload,
	});
};

const updateOrderDetail = (payload: UpdateOrderDetailQuantityRequest) => {
	return apiClient.put<void>({
		url: SalesOrderDetailApi.OrderDetail,
		data: payload,
	});
};

export default {
	getProductsByRestaurantOrder,
	createOrderDetail,
	updateOrderDetail,
};
