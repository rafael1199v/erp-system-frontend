import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { fCurrency } from "@/utils/format-number";
import type { AvailableOrderProduct } from "../types/order-detail";

type ProductCatalogItemCardProps = {
	product: AvailableOrderProduct;
	draftQuantity: number;
	isAddPending: boolean;
	onDraftQuantityChange: (value: number) => void;
	onAddProduct: () => void;
};

export default function ProductCatalogItemCard({
	product,
	draftQuantity,
	isAddPending,
	onDraftQuantityChange,
	onAddProduct,
}: ProductCatalogItemCardProps) {
	const isUnavailable = !product.isAvailable || product.availableStock <= 0 || product.productStatus !== "Available";

	return (
		<div className="space-y-3 rounded-xl border bg-muted/10 p-4">
			<div className="flex items-start justify-between gap-2">
				<div>
					<p className="font-medium text-text-primary">{product.name}</p>
					<p className="text-sm text-muted-foreground">Precio: {fCurrency(product.sellPrice)}</p>
				</div>
				<div className="flex flex-col items-end gap-2">
					<Badge variant={isUnavailable ? "destructive" : "success"}>
						{isUnavailable ? "No disponible" : "Disponible"}
					</Badge>
					<span className="text-xs text-muted-foreground">Stock: {product.availableStock}</span>
				</div>
			</div>

			<div className="flex items-center gap-2">
				<Input
					type="number"
					min={1}
					value={draftQuantity}
					onChange={(event) => {
						onDraftQuantityChange(Number(event.target.value));
					}}
					className="w-24"
				/>
				<Button className="flex-1" disabled={isAddPending} onClick={onAddProduct}>
					{isAddPending ? "Agregando..." : "Agregar al pedido"}
				</Button>
			</div>
		</div>
	);
}
