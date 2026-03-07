import { MovementStatus, MovementType } from "./enum";
import { CreateTransaction, Transaction } from "./transaction";

export interface Movement {
    id: number;
    title: string,
    movementDate: string,
    movementType: MovementType,
    movementStatus: MovementStatus,
    transactions: Array<Transaction>
}

export interface CreateMovement {
    title: string,
    movementDate: string,
    movementType: MovementType,
    movementStatus: MovementStatus,
    companyId: number,
    transactions: Array<CreateTransaction>
}