import type { CreateUnit, Unit } from "@/types/unit";
import apiClient from "../apiClient";

export enum UnitApi {
	Unit = "/inventory/unit",
}

const getUnits = (companyId: string) => {
	return apiClient.get<Unit[]>({
		url: `${UnitApi.Unit}/${companyId}`,
	});
};

const createUnit = (unit: CreateUnit) => {
	return apiClient.post<void>({
		url: `${UnitApi.Unit}`,
		data: unit,
	});
};

const updateUnit = (unit: Unit) => {
	return apiClient.put<void>({
		url: `${UnitApi.Unit}`,
		data: unit,
	});
};

export default {
	getUnits,
	createUnit,
	updateUnit,
};
