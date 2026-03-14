"use client"

import { ColumnDef } from "@tanstack/react-table";
import { ProductStatus } from "@/types/enum";
import { Button } from "@/ui/button";
import { useNavigate } from "react-router";
import productService from "@/api/services/productService";


interface ProductCatalogRow {
    productId: number,
    productName: string,
    unit: number,
    currentCost: number,
    imageUrl: string | null,
    categoryId: number,
    categoryName: string,
    statusCode: number,
    isActive: boolean,
    companyId: number
}

export const columns = (
    navigate: ReturnType<typeof useNavigate>,
    onRefresh: () => Promise<void>
): ColumnDef<ProductCatalogRow>[] => [
    {
        accessorKey: "productId",
        header: "Codigo"
    },
    {
        accessorKey: "productName",
        header: "Nombre"
    },
    {
        accessorKey: "categoryName",
        header: "Categoria"
    },
    {
        accessorKey: "unit",
        header: "Unidad"
    },
    {
        accessorKey: "statusCode",
        header: "Estado",

        cell: ({ row }) => {
            const status = parseInt(row.getValue("statusCode"));
            const isActive = Boolean(row.original.isActive);
            let formattedStatus = "Default";

            if(!isActive) {
                formattedStatus = "Desactivado";
            } 
            else if(status === ProductStatus.AVAILABLE) 
                formattedStatus = "Disponible";
            else 
                formattedStatus = "No disponible";
            

            return <div>{formattedStatus}</div>
        }
    },
    {
        accessorKey: "totalStock",
        header: "Total Stock"
    },
    { 
        accessorKey: "reorderLevel",
        header: "Reorder level"
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original;
            return (
                <Button variant="outline" onClick={() => navigate(`/transaction-details/${product.productId}`)} className="cursor-pointer">
                    Ver historial
                </Button>
            );
        }
    },
    {
        id: "edit-action",
        cell: ({ row }) => {
            const product: ProductCatalogRow = row.original;
            const navigate = useNavigate();

            return (
                <Button 
                    variant="outline" 
                    className="cursor-pointer"
                    onClick={() => {
                        navigate(`/products/form/${product.productId}`)
                    }}
                >
                    Editar
                </Button>
            );
        }
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
        }
    }
]