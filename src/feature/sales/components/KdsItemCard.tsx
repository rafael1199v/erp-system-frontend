import { Badge } from "@/ui/badge";
import { Card, CardContent } from "@/ui/card";
import { OrderDetailStatus } from "../enums/kds";
import type { KdsTeamItem } from "../types/kds";

type KdsItemCardProps = {
	item: KdsTeamItem;
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

export default function KdsItemCard({ item }: KdsItemCardProps) {
	const hasNote = Boolean(item.note?.trim());

	return (
		<Card className="gap-3 p-0">
			<CardContent className="space-y-3 p-4">
				<div className="flex flex-wrap items-start justify-between gap-2">
					<div>
						<p className="font-medium text-text-primary">{item.productName}</p>
					</div>
					<Badge variant={getStatusVariant(item.orderItemStatusId)}>{item.orderItemStatus}</Badge>
				</div>

				<div className="flex flex-wrap gap-2">
					<Badge variant="outline">Cant. {item.quantity}</Badge>
				</div>

				<div className="rounded-lg border bg-muted/20 p-3">
					<p className="text-xs font-medium text-muted-foreground">Nota</p>
					<p className="mt-1 text-sm text-text-primary">{hasNote ? item.note : "Sin nota"}</p>
				</div>
			</CardContent>
		</Card>
	);
}
