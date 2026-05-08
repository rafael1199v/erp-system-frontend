"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/ui/button";

export interface CategoryRow {
	id: number;
	name: string;
}

export const getColumns = (onEdit: (category: CategoryRow) => void): ColumnDef<CategoryRow>[] => [
	{
		accessorKey: "id",
		header: "Codigo",
	},
	{
		accessorKey: "name",
		header: "Nombre",
	},
	{
		id: "actions",
		header: "Acciones",
		cell: ({ row }) => {
			const category = row.original;

			return (
				<Button variant="outline" className="cursor-pointer" onClick={() => onEdit(category)}>
					Editar
				</Button>
			);
		},
	},
];
