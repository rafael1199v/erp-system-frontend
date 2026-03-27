import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { CircleAlert } from "lucide-react";
import { OrderDetailStatus } from "../enums/kds";
import type { KdsTeam, KdsTeamItem } from "../types/kds";
import KdsItemCard from "./KdsItemCard";

type KdsTeamSectionProps = {
	team: KdsTeam;
	items: KdsTeamItem[];
	isLoadingItems: boolean;
	hasItemsError: boolean;
	hideCanceledItems: boolean;
	isUpdatingStatus: boolean;
	onAdvanceStatus: (restaurantOrderDetailId: number, nextStatusId: number) => Promise<void>;
};

export default function KdsTeamSection({
	team,
	items,
	isLoadingItems,
	hasItemsError,
	hideCanceledItems,
	isUpdatingStatus,
	onAdvanceStatus,
}: KdsTeamSectionProps) {
	const visibleItems = hideCanceledItems
		? items.filter((item) => item.orderItemStatusId !== OrderDetailStatus.Canceled)
		: items;

	return (
		<Card className="gap-4">
			<CardHeader className="gap-2">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div>
						<CardTitle>{team.name}</CardTitle>
						<CardDescription>{team.categoryIds.length} categorias asociadas</CardDescription>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="outline">{items.length} items</Badge>
						{hideCanceledItems ? <Badge variant="secondary">Ocultando cancelados</Badge> : null}
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

				{!hasItemsError && !isLoadingItems && visibleItems.length > 0 ? (
					<div className="space-y-3">
						{visibleItems.map((item) => (
							<KdsItemCard
								key={`${item.restaurantOrderDetailId}-${item.productId}`}
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
