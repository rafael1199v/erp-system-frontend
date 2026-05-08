import type { Warehouse } from "@/types/warehouse";
import apiClient from "../apiClient";

export enum WarehouseApi {
	Warehouse = "/inventory/warehouse",
}

const getWarehousesByCompany = (companyId: string) => {
	return apiClient.get<Warehouse[]>({
		url: `${WarehouseApi.Warehouse}/${companyId}`,
	});
};

export default {
	getWarehousesByCompany,
};
