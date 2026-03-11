"use client";

import { Button } from "@/ui/button";
import type { ColumnDef } from "@tanstack/react-table";

export interface UnitRow {
  id: number;
  name: string;
}

export const getColumns = (
  onEdit: (unit: UnitRow) => void
): ColumnDef<UnitRow>[] => [
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
      const unit = row.original;

      return (
        <Button variant="outline" className="cursor-pointer" onClick={() => onEdit(unit)}>
          Editar
        </Button>
      );
    },
  },
];
