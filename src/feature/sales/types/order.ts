
export type CreateOrderRequest = {
	companyId: number;
};

export type CreateOrderResponse = {
	restaurantOrderId: number;
};

export type RestaurantOrder = {
	id: number;
	dailyNumber: number;
	orderDatetime: string;
	orderStatusId: number;
	customerId?: number | null;
	taxPrice: number;
	restaurantOrderId: number;
	waiterId?: number | null;
};

export type AssignWaiter = {
	restaurantOrderId: number,
	waiterId: number
}

export type Waiter = {
	id: number;
	name: string;
};