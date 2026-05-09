import type { ColumnDef } from "@tanstack/react-table";
import type { Transaction } from "@/types/transaction";

const getMovementTypeLabel = (movementType: string) => {
	if (movementType === "ENTRY") return "Entrada";
	if (movementType === "EXIT" || movementType === "SALE_EXIT") return "Salida";
	if (movementType === "ADJUSTMENT") return "Ajuste";
	return movementType;
};

export const getColumns = (): ColumnDef<Transaction>[] => [
	{
		accessorKey: "movementType",
		header: "Tipo de movimiento",
		cell: ({ row }) => <div>{getMovementTypeLabel(row.original.movementType)}</div>,
	},
	{
		accessorKey: "createdAt",
		header: "Fecha",
	},
	{
		accessorKey: "quantity",
		header: "Cantidad",
	},
	{
		accessorKey: "warehouseCen",
		header: "Almacen",
	},
	{
		accessorKey: "documentCen",
		header: "Documento",
	},
	{
		accessorKey: "reason",
		header: "Motivo",
	},
];
