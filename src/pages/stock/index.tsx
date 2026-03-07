import { Title } from "@/ui/typography";
import { DataTable } from "@/components/data-table";
import { getColumns } from "./columns";
import { ProductWithWarehouses } from "@/types/product";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelectedCompanyId } from "@/store/companyStore";
import productService from "@/api/services/productService";
import { mapProductWarehousesToDataRow } from "@/utils/mappers";

export default function ProductPage () {
    const [stock, setStock] = useState<ProductWithWarehouses[]>([]);
    const companyId = useSelectedCompanyId();

    const fetchStock = useCallback(async () => {
       const response = await productService.getProductsWithWarehouses(companyId || "-1");
       setStock(response.data);
    }, [companyId]);

    useEffect(() => {
        fetchStock();
    }, [fetchStock]);

    const columns = useMemo(() => getColumns(fetchStock), [fetchStock]);

    return (
        <div className="flex flex-col w-full h-full gap-4">
            <Title as="h1">
                Stock
            </Title>

            <div className="h-full w-11/12">
                <DataTable 
                    columns={columns}
                    data={mapProductWarehousesToDataRow(stock)}
                />
            </div>
        </div>
        
    );
}