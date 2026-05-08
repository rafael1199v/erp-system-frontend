import type { MovementType } from "@/types/enum";
import type { CreateMovement, Movement } from "@/types/movement";
import apiClient from "../apiClient";

export enum MovementApi {
	Movement = "/inventory/movement",
}

const createMovement = (movement: CreateMovement) => {
	return apiClient.post<void>({
		url: `${MovementApi.Movement}`,
		data: movement,
	});
};

const createAdjustment = (movement: CreateMovement) => {
	return apiClient.post<void>({
		url: `${MovementApi.Movement}/adjustment`,
		data: movement,
	});
};

const getMovementsByType = (movementType: MovementType, companyId: string) => {
	console.log(`${MovementApi.Movement}/${companyId}?movementType=${movementType}`);

	return apiClient.get<Movement[]>({
		url: `${MovementApi.Movement}/${companyId}?movementType=${movementType}`,
	});
};

const getMovements = (companyId: string) => {
	return apiClient.get<Movement[]>({
		url: `${MovementApi.Movement}/${companyId}?movementType=`,
	});
};

export default {
	createMovement,
	createAdjustment,
	getMovementsByType,
	getMovements,
};
