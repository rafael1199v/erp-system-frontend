import { CircleAlert, Package, PackageCheck, PackageX, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import companyService from "@/api/services/companyService";
import { useSelectedCompanyCen } from "@/store/companyStore";
import type { InventoryDashboard } from "@/types/company";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Title } from "@/ui/typography";
import { fNumber } from "@/utils/format-number";

const emptyDashboard: InventoryDashboard = {
	companyCen: "",
	totalProducts: 0,
	totalStockQuantity: 0,
	lowStockCount: 0,
	outOfStockCount: 0,
};

export default function DashboardAnalysisPage() {
	const companyCen = useSelectedCompanyCen();
	const [dashboard, setDashboard] = useState<InventoryDashboard>(emptyDashboard);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [hasError, setHasError] = useState<boolean>(false);

	useEffect(() => {
		const fetchDashboard = async () => {
			if (!companyCen) {
				setDashboard(emptyDashboard);
				return;
			}

			try {
				setIsLoading(true);
				setHasError(false);
				const response = await companyService.getInventoryDashboard(companyCen);
				setDashboard(response.data);
			} catch (error) {
				console.error(error);
				setHasError(true);
			} finally {
				setIsLoading(false);
			}
		};

		void fetchDashboard();
	}, [companyCen]);

	return (
		<div className="flex h-full w-full flex-col gap-5 pb-6">
			<div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Badge variant="info">Inventario</Badge>
						<Badge variant="outline">Contrato publico</Badge>
					</div>
					<Title as="h1">Resumen de inventario</Title>
					<p className="max-w-3xl text-sm text-muted-foreground">
						Consulta productos, stock disponible y alertas criticas usando el contrato publico por CEN.
					</p>
				</div>
			</div>

			{!companyCen ? (
				<Alert>
					<CircleAlert className="size-4" />
					<AlertTitle>Compania requerida</AlertTitle>
					<AlertDescription>Selecciona una compania para consultar los indicadores de inventario.</AlertDescription>
				</Alert>
			) : null}

			{hasError ? (
				<Alert>
					<CircleAlert className="size-4" />
					<AlertTitle>No se pudo cargar el dashboard</AlertTitle>
					<AlertDescription>Intenta recargar la pagina para volver a consultar los datos.</AlertDescription>
				</Alert>
			) : null}

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>Total productos</CardDescription>
						<CardTitle className="flex items-center gap-2 text-3xl">
							<Package className="size-6 text-primary" />
							<span>{isLoading ? "..." : fNumber(dashboard.totalProducts)}</span>
						</CardTitle>
					</CardHeader>
				</Card>

				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>Stock disponible</CardDescription>
						<CardTitle className="flex items-center gap-2 text-3xl">
							<PackageCheck className="size-6 text-primary" />
							<span>{isLoading ? "..." : fNumber(dashboard.totalStockQuantity)}</span>
						</CardTitle>
					</CardHeader>
				</Card>

				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>Stock bajo</CardDescription>
						<CardTitle className="flex items-center gap-2 text-3xl">
							<TriangleAlert className="size-6 text-warning" />
							<span>{isLoading ? "..." : fNumber(dashboard.lowStockCount)}</span>
						</CardTitle>
					</CardHeader>
				</Card>

				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>Sin stock</CardDescription>
						<CardTitle className="flex items-center gap-2 text-3xl">
							<PackageX className="size-6 text-destructive" />
							<span>{isLoading ? "..." : fNumber(dashboard.outOfStockCount)}</span>
						</CardTitle>
					</CardHeader>
				</Card>
			</div>
		</div>
	);
}
