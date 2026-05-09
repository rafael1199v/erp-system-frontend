export interface Transaction {
	movementCen: string;
	documentCen: string | null;
	quantity: number;
	reason: string | null;
	createdAt: string;
	movementType: string;
	productCen: string;
	warehouseCen: string;
	unitCost: number | null;
}
