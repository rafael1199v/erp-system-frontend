import type { CreateMovement, DocumentType, InventoryAdjustmentRequest, Movement } from "@/types/movement";
import apiClient from "../apiClient";

export enum MovementApi {
	Inventory = "/inventory",
}

const createMovement = (companyCen: string, movement: CreateMovement) => {
	return apiClient.post<Movement>({
		url: `${MovementApi.Inventory}/companies/${encodeURIComponent(companyCen)}/documents`,
		data: movement,
	});
};

const createAdjustment = (companyCen: string, adjustment: InventoryAdjustmentRequest) => {
	return apiClient.post<Movement>({
		url: `${MovementApi.Inventory}/companies/${encodeURIComponent(companyCen)}/stock/adjustments`,
		data: adjustment,
	});
};

const getMovementsByType = (documentType: DocumentType, companyCen: string) => {
	const params = new URLSearchParams({ documentType });

	return apiClient.get<Movement[]>({
		url: `${MovementApi.Inventory}/companies/${encodeURIComponent(companyCen)}/documents?${params.toString()}`,
	});
};

const getMovements = (companyCen: string) => {
	return apiClient.get<Movement[]>({
		url: `${MovementApi.Inventory}/companies/${encodeURIComponent(companyCen)}/documents`,
	});
};

export default {
	createMovement,
	createAdjustment,
	getMovementsByType,
	getMovements,
};
