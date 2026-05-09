import { useCallback, useEffect, useMemo, useState } from "react";
import productService from "@/api/services/productService";
import { DataTable } from "@/components/data-table";
import { useSelectedCompanyCen } from "@/store/companyStore";
import type { StockItem } from "@/types/product";
import { Title } from "@/ui/typography";
import { getColumns } from "./columns";

export default function ProductPage() {
	const [stock, setStock] = useState<StockItem[]>([]);
	const companyCen = useSelectedCompanyCen();

	const fetchStock = useCallback(async () => {
		if (!companyCen) {
			setStock([]);
			return;
		}

		const response = await productService.getStock(companyCen);
		setStock(response.data);
	}, [companyCen]);

	useEffect(() => {
		fetchStock();
	}, [fetchStock]);

	const columns = useMemo(() => getColumns(fetchStock), [fetchStock]);

	return (
		<div className="flex flex-col w-full h-full gap-4">
			<Title as="h1">Stock</Title>

			<div className="h-full w-11/12">
				<DataTable columns={columns} data={stock} />
			</div>
		</div>
	);
}
