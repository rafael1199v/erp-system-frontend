import { CircleAlert, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSelectedCompanyCen } from "@/store/companyStore";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/ui/select";
import { Title } from "@/ui/typography";
import KdsTeamSection from "../../components/KdsTeamSection";
import { useKds } from "../../hooks/use-kds";
import type { KdsItemStatus } from "../../types/kds";

export default function KdsPage() {
	const selectedCompanyCen = useSelectedCompanyCen();
	const companyCen = selectedCompanyCen ?? "";
	const hasValidCompanyCen = companyCen.trim() !== "";

	const [hideFinishedItems, setHideFinishedItems] = useState(true);
	const [selectedTeamCen, setSelectedTeamCen] = useState<string | null>(null);

	const {
		teams,
		itemsByTeamId,
		isLoadingTeams,
		hasTeamsError,
		isRefreshingAll,
		isLoadingItemsByTeamId,
		hasItemsErrorByTeamId,
		refreshAll,
		isUpdatingItemStatus,
		updateItemStatus,
	} = useKds(hasValidCompanyCen ? companyCen : null);

	useEffect(() => {
		if (teams.length === 0 || selectedTeamCen !== null) {
			return;
		}

		setSelectedTeamCen(teams[0].teamCen);
	}, [selectedTeamCen, teams]);

	const handleRefresh = async () => {
		if (!hasValidCompanyCen) {
			return;
		}

		await refreshAll();
		toast.success("Informacion KDS actualizada correctamente.");
	};

	const handleAdvanceStatus = async (ticketItemCen: string, nextStatus: KdsItemStatus) => {
		try {
			await updateItemStatus({ ticketItemCen, status: nextStatus });
			toast.success("Estado del item actualizado correctamente.");
		} catch {
			toast.error("No se pudo actualizar el estado del item. Intenta nuevamente.");
		}
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
						onClick={() => setHideFinishedItems((previous) => !previous)}
						disabled={!hasValidCompanyCen}
					>
						{hideFinishedItems ? "Mostrar cancelados y listos" : "Ocultar cancelados y listos"}
					</Button>
					<Button onClick={() => void handleRefresh()} disabled={!hasValidCompanyCen || isRefreshingAll}>
						<RefreshCw className="size-4" />
						{isRefreshingAll ? "Refrescando..." : "Refrescar"}
					</Button>
				</div>
			</div>

			{!hasValidCompanyCen ? (
				<Alert>
					<CircleAlert className="size-4" />
					<AlertTitle>Compania requerida</AlertTitle>
					<AlertDescription>
						Selecciona una compania para consultar los equipos KDS y sus items asociados.
					</AlertDescription>
				</Alert>
			) : null}

			{hasValidCompanyCen && hasTeamsError ? (
				<Alert>
					<CircleAlert className="size-4" />
					<AlertTitle>Error al cargar equipos KDS</AlertTitle>
					<AlertDescription>
						No fue posible consultar los equipos de la compania. Usa refrescar para intentar nuevamente.
					</AlertDescription>
				</Alert>
			) : null}

			{hasValidCompanyCen && isLoadingTeams ? (
				<p className="text-sm text-muted-foreground">Cargando equipos KDS...</p>
			) : null}

			{hasValidCompanyCen && !isLoadingTeams && teams.length === 0 ? (
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

			{hasValidCompanyCen && !isLoadingTeams && teams.length > 0 && selectedTeamCen !== null ? (
				<Select onValueChange={(value) => setSelectedTeamCen(value)} defaultValue={selectedTeamCen}>
					<SelectTrigger className="w-1/6 self-start">
						<SelectValue placeholder="Seleccione un equipo" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Equipos disponibles</SelectLabel>
							{teams.map((team) => (
								<SelectItem value={team.teamCen} key={team.teamCen}>
									{team.name}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			) : null}

			{hasValidCompanyCen && teams.length > 0 && selectedTeamCen !== null ? (
				<div className="flex flex-col gap-4">
					{teams
						.filter((team) => team.teamCen === selectedTeamCen)
						.map((team) => (
							<KdsTeamSection
								key={team.teamCen}
								team={team}
								items={itemsByTeamId[team.teamCen] ?? []}
								isLoadingItems={isLoadingItemsByTeamId[team.teamCen] ?? false}
								hasItemsError={hasItemsErrorByTeamId[team.teamCen] ?? false}
								hideFinishedItems={hideFinishedItems}
								isUpdatingStatus={isUpdatingItemStatus}
								onAdvanceStatus={handleAdvanceStatus}
							/>
						))}
				</div>
			) : null}
		</div>
	);
}
