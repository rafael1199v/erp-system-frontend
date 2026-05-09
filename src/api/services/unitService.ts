import type { CreateUnit, Unit } from "@/types/unit";
import apiClient from "../apiClient";

export enum UnitApi {
	Inventory = "/inventory",
}

const getUnits = (companyCen: string) => {
	return apiClient.get<Unit[]>({
		url: `${UnitApi.Inventory}/companies/${encodeURIComponent(companyCen)}/units`,
	});
};

const createUnit = (companyCen: string, unit: CreateUnit) => {
	return apiClient.post<Unit>({
		url: `${UnitApi.Inventory}/companies/${encodeURIComponent(companyCen)}/units`,
		data: unit,
	});
};

const updateUnit = (companyCen: string, unitCen: string, unit: CreateUnit) => {
	return apiClient.put<Unit>({
		url: `${UnitApi.Inventory}/companies/${encodeURIComponent(companyCen)}/units/${encodeURIComponent(unitCen)}`,
		data: unit,
	});
};

export default {
	getUnits,
	createUnit,
	updateUnit,
};
