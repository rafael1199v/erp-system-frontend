export type ProductContractDto = {
	productCen: string;
	sku: string;
	name: string;
	description: string | null;
	categoryCen: string;
	categoryName: string;
	unitCen: string;
	unitName: string;
	salePrice: number;
	costPrice: number | null;
	reorderLevel: number;
	status: string;
	stationCode: string | null;
};

export type ProductQuery = {
	search?: string;
	categoryCen?: string;
	status?: string;
};

export type ProductLookupContractRequest = {
	productCens: string[];
};

export type WarehouseContractDto = {
	warehouseCen: string;
	name: string;
	isActive: boolean;
};
