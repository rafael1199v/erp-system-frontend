import type { ProductWithWarehouseTableRow } from "@/pages/stock/columns";
import type { ProductWithWarehouses } from "@/types/product";

export function mapProductWarehousesToDataRow(products: ProductWithWarehouses[]): ProductWithWarehouseTableRow[] {
	const columns: ProductWithWarehouseTableRow[] = [];

	for (const productWithWarehouses of products) {
		for (const warehosue of productWithWarehouses.warehouses) {
			const column: ProductWithWarehouseTableRow = {
				productId: productWithWarehouses.product.productId,
				productName: productWithWarehouses.product.productName,
				unit: productWithWarehouses.product.unit,
				currentCost: productWithWarehouses.product.currentCost,

				categoryId: productWithWarehouses.product.categoryId,
				categoryName: productWithWarehouses.product.categoryName,
				statusCode: productWithWarehouses.product.statusCode,

				warehouseId: warehosue.id,
				warehouseName: warehosue.name,
				stock: warehosue.stock,
			};

			columns.push(column);
		}
	}

	return columns;
}
