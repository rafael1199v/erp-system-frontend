import { ProductWithWarehouses } from "@/types/product";
import { ProductWithWarehouseTableRow } from "@/pages/stock/columns";

export function mapProductWarehousesToDataRow(products: ProductWithWarehouses[]) : ProductWithWarehouseTableRow[] {
    const columns: ProductWithWarehouseTableRow[] = [];

    for(const productWithWarehouses of products) {
        for(const warehosue of productWithWarehouses.warehouses) {
            
            let column: ProductWithWarehouseTableRow = {
                productId: productWithWarehouses.product.productId,
                productName: productWithWarehouses.product.productName,
                unit: productWithWarehouses.product.unit,
                currentCost: productWithWarehouses.product.currentCost,

                categoryId: productWithWarehouses.product.categoryId,
                categoryName: productWithWarehouses.product.categoryName,
                statusCode: productWithWarehouses.product.statusCode,

                warehouseId: warehosue.id,
                warehouseName: warehosue.name,
                stock: warehosue.stock
            }

            columns.push(column);
        }
    }

    return columns;
}