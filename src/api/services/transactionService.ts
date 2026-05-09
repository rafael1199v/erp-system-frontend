import type { Transaction } from "@/types/transaction";
import apiClient from "../apiClient";

export enum TransactionApi {
	Inventory = "/inventory",
}

const getTransactionDetails = (companyCen: string, productCen: string) => {
	return apiClient.get<Transaction[]>({
		url: `${TransactionApi.Inventory}/companies/${encodeURIComponent(companyCen)}/products/${encodeURIComponent(productCen)}/kardex`,
	});
};

export default {
	getTransactionDetails,
};
