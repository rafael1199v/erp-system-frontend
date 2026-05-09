import type { ProductWithWarehouseTableRow } from "@/pages/stock/columns";
import type { StockItem } from "@/types/product";

export function mapProductWarehousesToDataRow(products: StockItem[]): ProductWithWarehouseTableRow[] {
	return products;
}
