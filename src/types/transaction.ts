import { TransactionType } from "./enum";

export interface Transaction {
    id: number;
    quantity: number;
    reason: string;
    transactionDate: string,
    transactionType: TransactionType,
    productId: number,
    warehouseId: number
}

export interface TransactionDetails {
    productId: number;
    productName: string,
    transactions: Array<Transaction>
}

export interface CreateTransaction {
    quantity: number;
    reason: string;
    transactionDate: string,
    transactionType: TransactionType,
    productId: number,
    warehouseId: number
}