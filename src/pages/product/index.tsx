import { Title } from "@/ui/typography";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { ProductCatalog } from "@/types/product";
import { useEffect, useState } from "react";
import { useSelectedCompanyId } from "@/store/companyStore";
import productService from "@/api/services/productService";

export default function ProductPage () {

    const [productCatalog, setProductCatalog] = useState<ProductCatalog[]>([]);
    const companyId = useSelectedCompanyId();

    useEffect(() => {
        const fetchCatalog = async () => {
           const response = await productService.getProductCatalog(companyId || "-1"); 
           console.log(response.data);

           setProductCatalog(response.data)
        }
        fetchCatalog();
    }, []);

    return (
        <div className="flex flex-col w-full h-full gap-4">
            <Title as="h1">
                Productos
            </Title>

            <div className="h-full w-11/12">
                <DataTable 
                    columns={columns}
                    data={productCatalog}
                />
            </div>
        </div>
        
    );
}