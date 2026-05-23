import type { ColumnDef } from "@tanstack/react-table";
import type { DocumentType, Movement } from "@/types/movement";

const getDocumentTypeLabel = (documentType: DocumentType) => {
	if (documentType === "ENTRY") return "Entrada";
	if (documentType === "EXIT" || documentType === "SALE_EXIT") return "Salida";
	return "Ajuste";
};

export const columns: ColumnDef<Movement>[] = [
	{
		accessorKey: "title",
		header: "Titulo",
		cell: ({ row }) => <div>{row.original.title || "Sin titulo"}</div>,
	},
	{
		accessorKey: "createdAt",
		header: "Fecha",
	},
	{
		accessorKey: "documentType",
		header: "Tipo",
		cell: ({ row }) => <div>{getDocumentTypeLabel(row.getValue("documentType"))}</div>,
	},
	{
		accessorKey: "totalItems",
		header: "Movimientos",
	},
];
