import apiClient from "../apiClient";
import { Warehouse } from "@/types/warehouse";

export enum WarehouseApi {
  Warehouse = "/warehouse"
}

const getWarehousesByCompany = (companyId: string) => {
    return apiClient.get<Warehouse[]>({
        url: `${WarehouseApi.Warehouse}/${companyId}`
    });
}

export default {
    getWarehousesByCompany
}