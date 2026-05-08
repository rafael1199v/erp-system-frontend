import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { canAdvanceKdsStatus, getNextKdsStatus, getOrderDetailStatusLabel, OrderDetailStatus } from "../enums/kds";
import type { KdsTeamItem } from "../types/kds";
import ResendCountBadge from "./ResendCountBadge";

type KdsItemCardProps = {
	item: KdsTeamItem;
	onAdvanceStatus: (restaurantOrderDetailId: number, nextStatusId: number) => Promise<void>;
	isUpdatingStatus: boolean;
};

const getStatusVariant = (statusId: number) => {
	switch (statusId) {
		case OrderDetailStatus.Created:
			return "info" as const;
		case OrderDetailStatus.Preparing:
			return "warning" as const;
		case OrderDetailStatus.Delivered:
			return "success" as const;
		case OrderDetailStatus.Canceled:
			return "destructive" as const;
		default:
			return "outline" as const;
	}
};

export default function KdsItemCard({ item, onAdvanceStatus, isUpdatingStatus }: KdsItemCardProps) {
	const hasNote = Boolean(item.note?.trim());
	const nextStatus = getNextKdsStatus(item.orderItemStatusId);
	const canAdvance = canAdvanceKdsStatus(item.orderItemStatusId) && nextStatus !== null;
	const actionLabel =
		nextStatus === OrderDetailStatus.Preparing
			? "Iniciar preparacion"
			: nextStatus === OrderDetailStatus.Delivered
				? "Marcar como listo"
				: "Actualizar estado";

	return (
		<Card className="gap-3 p-0">
			<CardContent className="space-y-3 p-4">
				<div className="flex flex-wrap items-start justify-between gap-2">
					<div>
						<p className="font-medium text-text-primary">{item.productName}</p>
					</div>
					<Badge variant={getStatusVariant(item.orderItemStatusId)}>
						{getOrderDetailStatusLabel(item.orderItemStatusId, item.orderItemStatus)}
					</Badge>
				</div>

				<div className="flex flex-wrap gap-2">
					<Badge variant="outline">Cant. {item.quantity}</Badge>
					<ResendCountBadge resendCount={item.resendCount} />
				</div>

				<div className="rounded-lg border bg-muted/20 p-3">
					<p className="text-xs font-medium text-muted-foreground">Nota</p>
					<p className="mt-1 text-sm text-text-primary">{hasNote ? item.note : "Sin nota"}</p>
				</div>

				{canAdvance ? (
					<div className="flex justify-end">
						<Button
							size="sm"
							onClick={() => {
								if (!nextStatus) {
									return;
								}

								void onAdvanceStatus(item.restaurantOrderDetailId, nextStatus);
							}}
							disabled={isUpdatingStatus}
						>
							{isUpdatingStatus ? "Actualizando..." : actionLabel}
						</Button>
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
