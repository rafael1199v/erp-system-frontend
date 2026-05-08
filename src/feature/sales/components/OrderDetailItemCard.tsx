import { Minus, Plus, RotateCcw } from "lucide-react";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Textarea } from "@/ui/textarea";
import { fCurrency } from "@/utils/format-number";
import type { AvailableOrderProduct, OrderItem } from "../types/order-detail";
import ResendCountBadge from "./ResendCountBadge";

type OrderDetailItemCardProps = {
	item: OrderItem;
	product?: AvailableOrderProduct;
	statusLabel: string;
	itemSubtotal: number;
	isEditable: boolean;
	canCancel: boolean;
	canResend: boolean;
	isUpdatingOrderDetail: boolean;
	isCancelingOrderDetail: boolean;
	isResendingOrderDetail: boolean;
	isCancelPending: boolean;
	isResendPending: boolean;
	isSaveNotePending: boolean;
	onDecreaseQuantity: () => void;
	onIncreaseQuantity: () => void;
	onCancelItem: () => void;
	onResendItem: () => void;
	onNoteChange: (note: string) => void;
	onSaveNote: () => void;
};

export default function OrderDetailItemCard({
	item,
	product,
	statusLabel,
	itemSubtotal,
	isEditable,
	canCancel,
	canResend,
	isUpdatingOrderDetail,
	isCancelingOrderDetail,
	isResendingOrderDetail,
	isCancelPending,
	isResendPending,
	isSaveNotePending,
	onDecreaseQuantity,
	onIncreaseQuantity,
	onCancelItem,
	onResendItem,
	onNoteChange,
	onSaveNote,
}: OrderDetailItemCardProps) {
	return (
		<div className="space-y-3 rounded-xl border bg-muted/10 p-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div>
					<p className="font-medium text-text-primary">{item.name}</p>
					<p className="text-sm text-muted-foreground">
						{item.sentAt ? `Enviado a las ${new Date(item.sentAt).toLocaleTimeString()}` : "Sin enviar"}
					</p>
					<p className="text-sm text-muted-foreground">Precio unitario: {fCurrency(item.unitPrice)}</p>
				</div>
				<p className="text-sm font-semibold text-text-primary">Subtotal: {fCurrency(itemSubtotal)}</p>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<Badge variant="outline">{statusLabel}</Badge>
				<Button
					variant="outline"
					size="icon"
					disabled={!product || !isEditable || isUpdatingOrderDetail || isCancelingOrderDetail}
					onClick={onDecreaseQuantity}
				>
					<Minus className="size-4" />
				</Button>
				<div className="min-w-16 rounded-md border bg-background px-3 py-1 text-center text-sm font-semibold">
					{item.quantity}
				</div>
				<Button
					variant="outline"
					size="icon"
					disabled={!product || !isEditable || isUpdatingOrderDetail || isCancelingOrderDetail}
					onClick={onIncreaseQuantity}
				>
					<Plus className="size-4" />
				</Button>
				<Button
					variant="destructive"
					size="sm"
					disabled={!item.restaurantOrderDetailId || !canCancel || isUpdatingOrderDetail || isCancelingOrderDetail}
					onClick={onCancelItem}
				>
					{isCancelPending ? "Cancelando..." : "Cancelar item"}
				</Button>
				<Button
					variant="secondary"
					size="sm"
					disabled={!item.restaurantOrderDetailId || !canResend || isResendingOrderDetail || isResendPending}
					onClick={onResendItem}
				>
					<RotateCcw className="size-4" />
					{isResendPending ? "Reenviando..." : "Reenviar"}
				</Button>
			</div>

			<div>
				<ResendCountBadge resendCount={item.resendCount} />
			</div>

			<div className="space-y-2">
				<Textarea
					value={item.note ?? ""}
					onChange={(event) => {
						onNoteChange(event.target.value);
					}}
					placeholder="Notas para cocina (opcional)"
					rows={2}
					disabled={!isEditable}
				/>
				<div className="flex justify-end">
					<Button
						variant="secondary"
						size="sm"
						disabled={!item.restaurantOrderDetailId || !isEditable || isSaveNotePending || isCancelingOrderDetail}
						onClick={onSaveNote}
					>
						{isSaveNotePending ? "Guardando..." : "Guardar nota"}
					</Button>
				</div>
			</div>
		</div>
	);
}
