import type { Supplier } from "@/types/supplier";
import apiClient from "../apiClient";

export enum SupplierApi {
	Supplier = "/inventory/supplier",
}

const getSuppliers = (companyId: string) => {
	return apiClient.get<Supplier[]>({
		url: `${SupplierApi.Supplier}/${companyId}`,
	});
};

export default {
	getSuppliers,
};
