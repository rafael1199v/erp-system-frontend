"use client";

import { ColumnDef } from "@tanstack/react-table";
import ChangeStockDialog from "./components/change-stock-dialog";

export interface ProductWithWarehouseTableRow {
  productId: number;
  productName: string;
  unit: number;
  currentCost: number;

  categoryId: number;
  categoryName: string;
  statusCode: number;

  warehouseId: number;
  warehouseName: string;
  stock: number;
}

export const getColumns = (
  onStockUpdated: () => Promise<void>
): ColumnDef<ProductWithWarehouseTableRow>[] => [
  {
    accessorKey: "productId",
    header: "Code",
  },
  {
    accessorKey: "productName",
    header: "Product name",
  },
  {
    accessorKey: "unit",
    header: "Unit",
  },
  {
    accessorKey: "categoryName",
    header: "Category",
  },
  {
    accessorKey: "warehouseName",
    header: "Warehouse",
  },
  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const productWithWarehouse = row.original;
      
      return ( 
        <ChangeStockDialog 
          productWithWarehouse={productWithWarehouse} 
          onStockUpdated={onStockUpdated}
        />
      );
    }
  },
];
