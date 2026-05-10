export type DocumentType = "ENTRY" | "EXIT" | "SALE_EXIT" | "ADJUSTMENT";
export type AdjustmentType = "INCREASE" | "DECREASE";

export interface Movement {
	documentCen: string;
	documentType: DocumentType;
	status: string;
	title?: string | null;
	createdAt: string;
	totalItems: number;
	generatedMovementCens: string[];
}

export interface CreateMovement {
	documentType: Exclude<DocumentType, "ADJUSTMENT">;
	warehouseCen: string;
	reason?: string | null;
	externalReference?: string | null;
	lines: Array<InventoryDocumentLineRequest>;
}

export interface InventoryDocumentLineRequest {
	productCen: string;
	quantity: number;
	unitCost?: number | null;
}

export interface InventoryAdjustmentRequest {
	warehouseCen: string;
	reason: string;
	lines: Array<InventoryAdjustmentLineRequest>;
}

export interface InventoryAdjustmentLineRequest {
	productCen: string;
	quantity: number;
	adjustmentType: AdjustmentType;
}
