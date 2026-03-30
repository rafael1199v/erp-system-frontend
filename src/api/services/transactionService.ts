import apiClient from "../apiClient";
import { TransactionDetails } from "@/types/transaction";

export enum TransactionApi {
    Transaction = "/inventory/transaction"
}

const getTransactionDetails = (productId: string) => {
    return apiClient.get<TransactionDetails>({
        url: `${TransactionApi.Transaction}/details/${productId}`
    });
}

export default {
    getTransactionDetails
}

