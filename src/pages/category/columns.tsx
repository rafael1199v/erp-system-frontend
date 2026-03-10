"use client";

import type { ColumnDef } from "@tanstack/react-table";

export interface CategoryRow {
  id: number;
  name: string;
//   createdAt: string;
}

export const columns: ColumnDef<CategoryRow>[] = [
  {
    accessorKey: "id",
    header: "Codigo",
  },
  {
    accessorKey: "name",
    header: "Nombre",
  },
//   {
//     accessorKey: "createdAt",
//     header: "Fecha de creacion",
//   },
];
