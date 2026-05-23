export type KdsItemStatus = "created" | "preparing" | "delivered" | "canceled" | "cancelled" | string;

export type KdsTeam = {
	teamCen: string;
	name: string;
	categoryCens: string[];
};

export type KdsTeamItem = {
	ticketItemCen: string;
	ticketCen: string;
	productCen: string;
	productName: string;
	quantity: number;
	status: KdsItemStatus;
	note: string | null;
	resendCount: number;
	createdAt: string;
};

export type UpdateKdsItemStatusRequest = {
	status: KdsItemStatus;
};

export type KdsStatusUpdateResponse = {
	ticketItemCen: string;
	status: KdsItemStatus;
};
