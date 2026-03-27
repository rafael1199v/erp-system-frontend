import type { RestaurantOrder } from "./order";

export type AvailableOrderProduct = {
	productId: number;
	name: string;
	sellPrice: number;
	availableStock: number;
	isAvailable: boolean;
	productStatus: string;
};

export type CreateOrderDetailRequest = {
	restaurantOrderId: number;
	productId: number;
	note?: string | null;
	quantity: number;
	createdAt?: string | null;
};

export type UpdateOrderDetailQuantityRequest = {
	restaurantOrderDetailId: number;
	quantity: number;
	note?: string | null;
};

export type UpdateOrderDetailStatusRequest = {
	restaurantOrderDetailId: number;
	newStatusId: number;
};

export type CreateOrderDetailResponse = {
	restaurantOrderDetailId: number;
};

export type ProductDraftQuantity = Record<number, number>;

export type OrderItem = {
	productId: number;
	name: string;
	unitPrice: number;
	quantity: number;
	note: string | null;
	restaurantOrderDetailId: number | null;
	sentAt: string | null;
	restaurantOrderStatusId: number;
	restaurantOrderStatus: string;
};

export type OrderLocationState = {
	restaurantOrder?: RestaurantOrder;
};

