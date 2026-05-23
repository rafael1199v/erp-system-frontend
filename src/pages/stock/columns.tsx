"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { StockItem } from "@/types/product";
import ChangeStockDialog from "./components/change-stock-dialog";

export type ProductWithWarehouseTableRow = StockItem;

export const getColumns = (onStockUpdated: () => Promise<void>): ColumnDef<ProductWithWarehouseTableRow>[] => [
	{
		accessorKey: "productCen",
		header: "Code",
	},
	{
		accessorKey: "productName",
		header: "Product name",
	},
	{
		accessorKey: "unitName",
		header: "Unit",
	},
	{
		accessorKey: "availableQuantity",
		header: "Stock",
	},
	{
		accessorKey: "warehouseName",
		header: "Warehouse",
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const productWithWarehouse = row.original;

			return <ChangeStockDialog productWithWarehouse={productWithWarehouse} onStockUpdated={onStockUpdated} />;
		},
	},
];
