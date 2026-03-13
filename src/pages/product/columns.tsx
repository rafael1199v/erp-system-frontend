"use client"

import { ProductCatalog } from "@/types/product";
import { ColumnDef } from "@tanstack/react-table";
import { ProductStatus } from "@/types/enum";
import { Button } from "@/ui/button";
import { useNavigate } from "react-router";


export const columns: ColumnDef<ProductCatalog>[] = [
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
            let formattedStatus = "Default";

            if(status === ProductStatus.AVAILABLE) 
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
            const product: ProductCatalog = row.original;
            const navigate = useNavigate();

            return (
                <Button 
                    variant="outline" 
                    className="cursor-pointer"
                    onClick={() => {
                        navigate(`/transaction-details/${product.productId}`)
                    }}
                >
                    Ver historial
                </Button>
            );
        }
    },
    {
        id: "edit-action",
        cell: ({ row }) => {
            const product: ProductCatalog = row.original;
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
    }
]