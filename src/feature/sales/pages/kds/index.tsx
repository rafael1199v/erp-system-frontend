import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Title } from "@/ui/typography";
import { useSelectedCompanyId } from "@/store/companyStore";
import { CircleAlert, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import KdsTeamSection from "../../components/KdsTeamSection";
import { useKds } from "../../hooks/use-kds";

export default function KdsPage() {
	const selectedCompanyId = useSelectedCompanyId();
	const companyId = Number.parseInt(selectedCompanyId ?? "", 10);
	const hasValidCompany = Number.isInteger(companyId) && companyId > 0;
	const [hideCanceledItems, setHideCanceledItems] = useState(true);

	const {
		teams,
		itemsByTeamId,
		isLoadingTeams,
		hasTeamsError,
		isRefreshingAll,
		isLoadingItemsByTeamId,
		hasItemsErrorByTeamId,
		refreshAll,
	} = useKds(hasValidCompany ? companyId : null);

	const handleRefresh = async () => {
		if (!hasValidCompany) {
			return;
		}

		await refreshAll();
		toast.success("Informacion KDS actualizada correctamente.");
	};

	return (
		<div className="flex h-full w-full flex-col gap-5 pb-6">
			<div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Badge variant="info">Ventas</Badge>
						<Badge variant="outline">Kitchen Display System</Badge>
					</div>
					<Title as="h1">KDS</Title>
					<p className="max-w-2xl text-sm text-muted-foreground">
						Visualiza todos los equipos de preparacion de la compania y monitorea sus items en tiempo real.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Button
						variant="outline"
						onClick={() => setHideCanceledItems((previous) => !previous)}
						disabled={!hasValidCompany}
					>
						{hideCanceledItems ? "Mostrar cancelados" : "Ocultar cancelados"}
					</Button>
					<Button onClick={() => void handleRefresh()} disabled={!hasValidCompany || isRefreshingAll}>
						<RefreshCw className="size-4" />
						{isRefreshingAll ? "Refrescando..." : "Refrescar"}
					</Button>
				</div>
			</div>

			{!hasValidCompany ? (
				<Alert>
					<CircleAlert className="size-4" />
					<AlertTitle>Compania requerida</AlertTitle>
					<AlertDescription>
						Selecciona una compania para consultar los equipos KDS y sus items asociados.
					</AlertDescription>
				</Alert>
			) : null}

			{hasValidCompany && hasTeamsError ? (
				<Alert>
					<CircleAlert className="size-4" />
					<AlertTitle>Error al cargar equipos KDS</AlertTitle>
					<AlertDescription>
						No fue posible consultar los equipos de la compania. Usa refrescar para intentar nuevamente.
					</AlertDescription>
				</Alert>
			) : null}

			{hasValidCompany && isLoadingTeams ? (
				<p className="text-sm text-muted-foreground">Cargando equipos KDS...</p>
			) : null}

			{hasValidCompany && !isLoadingTeams && teams.length === 0 ? (
				<Card>
					<CardContent>
						<div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
							<p className="text-sm font-medium text-text-primary">No hay equipos KDS para esta compania.</p>
							<p className="mt-2 text-sm text-muted-foreground">
								Cuando existan equipos, cada uno se mostrara como una seccion independiente.
							</p>
						</div>
					</CardContent>
				</Card>
			) : null}

			{hasValidCompany && teams.length > 0 ? (
				<div className="grid gap-4 xl:grid-cols-2">
					{teams.map((team) => (
						<KdsTeamSection
							key={team.id}
							team={team}
							items={itemsByTeamId[team.id] ?? []}
							isLoadingItems={isLoadingItemsByTeamId[team.id] ?? false}
							hasItemsError={hasItemsErrorByTeamId[team.id] ?? false}
							hideCanceledItems={hideCanceledItems}
						/>
					))}
				</div>
			) : null}
		</div>
	);
}
