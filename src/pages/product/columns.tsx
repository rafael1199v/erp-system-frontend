"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { useNavigate } from "react-router";
import productService from "@/api/services/productService";
import type { ProductContractStatus } from "@/types/product";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";

export interface ProductCatalogRow {
	productCen: string;
	sku: string;
	name: string;
	description: string | null;
	categoryCen: string;
	categoryName: string;
	unitCen: string;
	unitName: string;
	salePrice: number;
	costPrice: number | null;
	reorderLevel: number;
	status: ProductContractStatus;
}

const getProductStatusBadge = (status: ProductContractStatus) => {
	if (status === "ACTIVE") {
		return <Badge variant="success">Disponible</Badge>;
	}

	if (status === "OUT_OF_STOCK") {
		return <Badge variant="warning">Sin stock</Badge>;
	}

	if (status === "INACTIVE") {
		return <Badge variant="warning">No disponible</Badge>;
	}

	return <Badge variant="default">Desconocido</Badge>;
};

export const columns = (
	navigate: ReturnType<typeof useNavigate>,
	onRefresh: () => Promise<void>,
	companyCen: string | null,
): ColumnDef<ProductCatalogRow>[] => [
	{
		accessorKey: "productCen",
		header: "Codigo",
	},
	{
		accessorKey: "sku",
		header: "SKU",
	},
	{
		accessorKey: "name",
		header: "Nombre",
	},
	{
		accessorKey: "categoryName",
		header: "Categoria",
	},
	{
		accessorKey: "unitName",
		header: "Unidad",
	},
	{
		accessorKey: "status",
		header: "Estado Catalogo",

		cell: ({ row }) => {
			const status = row.getValue("status") as ProductContractStatus;
			return getProductStatusBadge(status);
		},
	},
	{
		accessorKey: "salePrice",
		header: "Precio venta",
	},
	{
		accessorKey: "reorderLevel",
		header: "Reorder level",
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const product = row.original;
			return (
				<Button
					variant="outline"
					onClick={() => navigate(`/transaction-details/${encodeURIComponent(product.productCen)}`)}
					className="cursor-pointer"
				>
					Ver historial
				</Button>
			);
		},
	},
	{
		id: "edit-action",
		cell: ({ row }) => {
			const product: ProductCatalogRow = row.original;

			return (
				<Button
					variant="outline"
					className="cursor-pointer"
					onClick={() => {
						navigate(`/products/form/${encodeURIComponent(product.productCen)}`);
					}}
				>
					Editar
				</Button>
			);
		},
	},
	{
		id: "toggle-product",
		cell: ({ row }) => {
			const product = row.original;

			const handleToggle = async () => {
				try {
					if (!companyCen) return;

					if (product.status === "ACTIVE") {
						await productService.deactivateProduct(companyCen, product.productCen);
					} else {
						await productService.activateProduct(companyCen, product.productCen);
					}
					await onRefresh();
				} catch (error) {
					console.error("Failed to toggle product status", error);
				}
			};

			return (
				<Button variant="outline" onClick={handleToggle} className="w-full cursor-pointer">
					{product.status === "ACTIVE" ? "Desactivar" : "Activar"}
				</Button>
			);
		},
	},
];
