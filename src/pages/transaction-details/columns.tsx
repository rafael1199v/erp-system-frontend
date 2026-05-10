import type { ColumnDef } from "@tanstack/react-table";
import type { Transaction } from "@/types/transaction";

const getMovementTypeLabel = (movementType: string) => {
	if (movementType === "ENTRY") return "Entrada";
	if (movementType === "EXIT" || movementType === "SALE_EXIT") return "Salida";
	if (movementType === "ADJUSTMENT") return "Ajuste";
	if (movementType === "ADJUSTMENT_IN") return "Ajuste Entrada";
	if (movementType === "ADJUSTMENT_OUT") return "Ajuste Salida";
	// if (movementType === "SALE_EXIT") return "Salida por venta";
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
		cell: ({ row }) => {
			const movementType = row.original.movementType;

			if(["ADJUSTMENT_OUT", "SALE_EXIT", "EXIT"].includes(movementType)) {
				return <div>{`-${row.original.quantity}`}</div>;
			}
			
			return <div>{row.original.quantity}</div>;
		}
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
