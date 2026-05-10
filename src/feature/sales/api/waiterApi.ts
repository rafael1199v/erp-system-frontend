import apiClient from "@/api/apiClient";
import type { Waiter } from "../types/order";

export enum WaiterApi {
	Sales = "/sales",
}

const getWaiters = (companyCen: string) => {
	return apiClient.get<Waiter[]>({
		url: `${WaiterApi.Sales}/companies/${encodeURIComponent(companyCen)}/waiters`,
	});
};

export default {
	getWaiters,
};
