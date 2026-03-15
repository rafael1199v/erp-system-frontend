import type { Waiter } from "../types/order";

const COMPANY_WAITERS: Record<number, Waiter[]> = {
	1: [
		{ id: 1, name: "Carlos" },
		{ id: 2, name: "Maria" },
		{ id: 3, name: "Jose" },
		{ id: 4, name: "Ana" },
	],
	2: [
		{ id: 1, name: "Carlos" },
		{ id: 2, name: "Maria" },
		{ id: 3, name: "Jose" },
		{ id: 4, name: "Ana" },
	],
    3: [
		{ id: 1, name: "Carlos" },
		{ id: 2, name: "Maria" },
		{ id: 3, name: "Jose" },
		{ id: 4, name: "Ana" },
	],
};

const getWaiters = async (companyId: number): Promise<Waiter[]> => {
	await new Promise((resolve) => setTimeout(resolve, 3000))
	return COMPANY_WAITERS[companyId];
};

export default {
	getWaiters,
};