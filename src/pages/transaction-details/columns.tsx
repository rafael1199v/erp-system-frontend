import type { ColumnDef } from "@tanstack/react-table";
import { TransactionType } from "@/types/enum";
import type { Transaction } from "@/types/transaction";

export const getColumns = (): ColumnDef<Transaction>[] => [
	{
		accessorKey: "transactionType",
		header: "Tipo de transacción",

		cell: ({ row }) => {
			const transaction: Transaction = row.original;
			let formattedType = "Default";

			if (transaction.transactionType === TransactionType.IN) {
				formattedType = "Entrada";
			} else if (transaction.transactionType === TransactionType.OUT) {
				formattedType = "Salida";
			} else if (transaction.transactionType === TransactionType.ADJUSTMENT) {
				formattedType = "Ajuste";
			}

			return <div>{formattedType}</div>;
		},
	},
	{
		accessorKey: "transactionDate",
		header: "Fecha",
	},
	{
		accessorKey: "quantity",
		header: "Cantidad",

		cell: ({ row }) => {
			const transaction: Transaction = row.original;
			let sign: string = "";

			if (transaction.quantity > 0) {
				sign = "+";
			}

			return (
				<div>
					{sign}
					{transaction.quantity}
				</div>
			);
		},
	},
	{
		accessorKey: "reason",
		header: "Motivo",
	},
];
