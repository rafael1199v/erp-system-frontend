import type { ColumnDef } from "@tanstack/react-table";
import { MovementStatus, MovementType } from "@/types/enum";
import type { Movement } from "@/types/movement";

export const columns: ColumnDef<Movement>[] = [
	{
		accessorKey: "id",
		header: "Código",
	},
	{
		accessorKey: "title",
		header: "Título",
	},
	{
		accessorKey: "movementDate",
		header: "Fecha",
	},
	{
		accessorKey: "movementType",
		header: "Tipo",
		cell: ({ row }) => {
			const movementType = row.getValue("movementType") as MovementType;

			if (movementType === MovementType.RECEIPT) return <div>Entrada</div>;
			if (movementType === MovementType.ISSUE) return <div>Salida</div>;

			return <div>Ajuste</div>;
		},
	},
	{
		accessorKey: "movementStatus",
		header: "Estado",
		cell: ({ row }) => {
			const movementStatus = row.getValue("movementStatus") as MovementStatus;

			if (movementStatus === MovementStatus.COMPLETED) return <div>Completado</div>;

			return <div>Borrador</div>;
		},
	},
	{
		accessorKey: "transactions",
		header: "Transacciones",
		cell: ({ row }) => <div>{row.original.transactions.length}</div>,
	},
];
