"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ProductStatus } from "@/types/enum";
import { Button } from "@/ui/button";
import type { useNavigate } from "react-router";
import productService from "@/api/services/productService";
import { Badge } from "@/ui/badge";

export interface ProductCatalogRow {
	productId: number;
	productName: string;
	unit: number;
	currentCost: number;
	imageUrl: string | null;
	categoryId: number;
	categoryName: string;
	statusCode: number;
	isActive: boolean;
	companyId: number;
}

const getIsActiveBadge = (isActive: boolean) => {
	if (isActive) {
		return <Badge variant="success">Activo</Badge>;
	}

	return <Badge variant="error">Inactivo</Badge>;
};

const getProductStatusBadge = (statusCode: number) => {
	if (statusCode === ProductStatus.AVAILABLE) {
		return <Badge variant="success">Disponible</Badge>;
	}

	if (statusCode === ProductStatus.UNAVAILABLE) {
		return <Badge variant="warning">No disponible</Badge>;
	}

	return <Badge variant="default">Desconocido</Badge>;
};

export const columns = (
	navigate: ReturnType<typeof useNavigate>,
	onRefresh: () => Promise<void>,
): ColumnDef<ProductCatalogRow>[] => [
	{
		accessorKey: "productId",
		header: "Codigo",
	},
	{
		accessorKey: "productName",
		header: "Nombre",
	},
	{
		accessorKey: "categoryName",
		header: "Categoria",
	},
	{
		accessorKey: "unit",
		header: "Unidad",
	},
	{
		accessorKey: "statusCode",
		header: "Estado Catalogo",

		cell: ({ row }) => {
			const status = Number(row.getValue("statusCode"));
			return getProductStatusBadge(status);
		},
	},
	{
		accessorKey: "isActive",
		header: "Activo",
		cell: ({ row }) => getIsActiveBadge(Boolean(row.getValue("isActive"))),
	},
	{
		accessorKey: "totalStock",
		header: "Total Stock",
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
					onClick={() => navigate(`/transaction-details/${product.productId}`)}
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
						navigate(`/products/form/${product.productId}`);
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
					if (product.isActive) {
						await productService.deactivateProduct(product.productId, product.companyId);
					} else {
						await productService.activateProduct(product.productId, product.companyId);
					}
					await onRefresh();
				} catch (error) {
					console.error("Failed to toggle product status", error);
				}
			};

			return (
				<Button variant="outline" onClick={handleToggle} className="w-full cursor-pointer">
					{product.isActive ? "Desactivar" : "Activar"}
				</Button>
			);
		},
	},
];
