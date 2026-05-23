import type { Warehouse } from "@/types/warehouse";
import apiClient from "../apiClient";

export enum WarehouseApi {
	Inventory = "/inventory",
}

const getWarehousesByCompany = (companyCen: string) => {
	return apiClient.get<Warehouse[]>({
		url: `${WarehouseApi.Inventory}/companies/${encodeURIComponent(companyCen)}/warehouses`,
	});
};

export default {
	getWarehousesByCompany,
};
