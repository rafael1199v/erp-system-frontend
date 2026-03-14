import { Title } from "@/ui/typography";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { ProductCatalog } from "@/types/product";
import { useEffect, useState } from "react";
import { useSelectedCompanyId } from "@/store/companyStore";
import productService from "@/api/services/productService";
import { useNavigate } from "react-router";
import { Button } from "@/ui/button";

export default function ProductPage () {

    const [productCatalog, setProductCatalog] = useState<ProductCatalog[]>([]);
    const companyId = useSelectedCompanyId();
    const nav = useNavigate();

    const fetchCatalog = async () => {
        const response = await productService.getProductCatalog(companyId || "-1");
        console.log(response.data);
        setProductCatalog(response.data);
    };

    useEffect(() => {
        fetchCatalog();
    }, [companyId]);

    return (
        <div className="flex flex-col w-full h-full gap-4">
            <Title as="h1">
                Productos
            </Title>

            <Button
                variant="default" 
                className="cursor-pointer"
                onClick={() => {
                    nav("/products/form")
                }}
            >
                Crear producto
            </Button>

            <div className="h-full w-11/12">
               <DataTable
                    columns={columns(nav, fetchCatalog)}  // pass nav and refresh callback
                    data={productCatalog.map(pc => ({ ...pc, companyId: Number(companyId) }))}
                />
            </div>
        </div>
        
    );
}