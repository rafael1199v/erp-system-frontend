export type KdsTeam = {
	id: number;
	name: string;
	categoryIds: number[];
};

export type KdsTeamItem = {
	productId: number;
	categoryId: number;
	restaurantOrderDetailId: number;
	restaurantOrderId: number;
	productName: string;
	quantity: number;
	orderItemStatus: string;
	orderItemStatusId: number;
	note: string | null;
	resendCount: number;
};
