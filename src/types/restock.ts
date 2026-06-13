export interface RestockItem {
	productCen: string;
	quantity: number;
}

export interface RestockEvent {
	companyCen: string;
	warehouseCen: string;
	referenceCen: string;
	occurredAt: string;
	items: RestockItem[];
}
