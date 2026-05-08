import type { TransactionDetails } from "@/types/transaction";
import apiClient from "../apiClient";

export enum TransactionApi {
	Transaction = "/inventory/transaction",
}

const getTransactionDetails = (productId: string) => {
	return apiClient.get<TransactionDetails>({
		url: `${TransactionApi.Transaction}/details/${productId}`,
	});
};

export default {
	getTransactionDetails,
};
