import { CircleAlert } from "lucide-react";
import { useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { normalizeOrderDetailStatus, OrderDetailStatus } from "../enums/kds";
import type { KdsItemStatus, KdsTeam, KdsTeamItem } from "../types/kds";
import KdsItemCard from "./KdsItemCard";

type KdsTeamSectionProps = {
	team: KdsTeam;
	items: KdsTeamItem[];
	isLoadingItems: boolean;
	hasItemsError: boolean;
	hideFinishedItems: boolean;
	isUpdatingStatus: boolean;
	onAdvanceStatus: (ticketItemCen: string, nextStatus: KdsItemStatus) => Promise<void>;
};

export default function KdsTeamSection({
	team,
	items,
	isLoadingItems,
	hasItemsError,
	hideFinishedItems,
	isUpdatingStatus,
	onAdvanceStatus,
}: KdsTeamSectionProps) {
	const visibleItems = hideFinishedItems
		? items.filter(
				(item) =>
					normalizeOrderDetailStatus(item.status) !== OrderDetailStatus.Canceled &&
					normalizeOrderDetailStatus(item.status) !== OrderDetailStatus.Delivered,
			)
		: items;

	const sortedVisibleItems = useMemo(() => {
		return [...visibleItems].sort((left, right) => {
			const leftResendCount = Number.isFinite(left.resendCount) ? left.resendCount : 0;
			const rightResendCount = Number.isFinite(right.resendCount) ? right.resendCount : 0;

			if (rightResendCount !== leftResendCount) {
				return rightResendCount - leftResendCount;
			}

			return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
		});
	}, [visibleItems]);

	return (
		<Card className="gap-4">
			<CardHeader className="gap-2">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div>
						<CardTitle>{team.name}</CardTitle>
						<CardDescription>{team.categoryCens.length} categorias asociadas</CardDescription>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="outline">{items.length} items</Badge>
						{hideFinishedItems ? <Badge variant="secondary">Ocultando cancelados y listos</Badge> : null}
					</div>
				</div>
			</CardHeader>

			<CardContent>
				{hasItemsError ? (
					<Alert>
						<CircleAlert className="size-4" />
						<AlertTitle>Error al cargar items</AlertTitle>
						<AlertDescription>
							No se pudieron consultar los items de este equipo. Usa el boton refrescar para intentar nuevamente.
						</AlertDescription>
					</Alert>
				) : null}

				{!hasItemsError && isLoadingItems ? (
					<p className="text-sm text-muted-foreground">Cargando items del equipo...</p>
				) : null}

				{!hasItemsError && !isLoadingItems && visibleItems.length === 0 ? (
					<div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
						<p className="text-sm font-medium text-text-primary">No hay items disponibles para este equipo.</p>
					</div>
				) : null}

				{!hasItemsError && !isLoadingItems && sortedVisibleItems.length > 0 ? (
					<div className="space-y-3">
						{sortedVisibleItems.map((item) => (
							<KdsItemCard
								key={`${item.ticketItemCen}-${item.productCen}`}
								item={item}
								onAdvanceStatus={onAdvanceStatus}
								isUpdatingStatus={isUpdatingStatus}
							/>
						))}
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
