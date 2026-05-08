import apiClient from "@/api/apiClient";
import type { Waiter } from "../types/order";

export enum WaiterApi {
	Waiter = "/sales/waiter",
}

const getWaiters = (companyId: number) => {
	return apiClient.get<Waiter[]>({
		url: `${WaiterApi.Waiter}/${companyId}`,
	});
};

export default {
	getWaiters,
};
