import { CircleAlert, Clock3, Package, ShoppingCart, Ticket, TriangleAlert, UtensilsCrossed } from "lucide-react";
import { useMemo } from "react";
import { AlertInv } from "@/components/alert-inv";
import { useSelectedCompanyId } from "@/store/companyStore";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Text, Title } from "@/ui/typography";
import { fCurrency, fNumber } from "@/utils/format-number";
import { useDashboardDailySales } from "../../hooks/use-dashboard-daily-sales";
import { useDashboardKdsStatus } from "../../hooks/use-dashboard-kds-status";
import { useDashboardLowStock } from "../../hooks/use-dashboard-low-stock";
import { useDashboardTopProducts } from "../../hooks/use-dashboard-top-products";

const getStockStateLabel = (stockState: string) => {
	if (stockState === "OutOfStock") {
		return "Sin stock";
	}

	if (stockState === "LowStock") {
		return "Stock bajo";
	}

	return stockState;
};

const getStockStateVariant = (stockState: string) => {
	if (stockState === "OutOfStock") {
		return "destructive" as const;
	}

	if (stockState === "LowStock") {
		return "warning" as const;
	}

	return "outline" as const;
};

export default function DashboardAnalysisPage() {
	const selectedCompanyId = useSelectedCompanyId();
	const companyId = Number.parseInt(selectedCompanyId ?? "", 10);
	const hasValidCompany = Number.isInteger(companyId) && companyId > 0;

	const { dailySales, isLoadingDailySales, dailySalesErrorMessage } = useDashboardDailySales(
		hasValidCompany ? companyId : null,
	);
	const { kdsStatus, isLoadingKdsStatus, kdsStatusErrorMessage } = useDashboardKdsStatus(
		hasValidCompany ? companyId : null,
	);
	const { topProducts, isLoadingTopProducts, topProductsErrorMessage } = useDashboardTopProducts(
		hasValidCompany ? companyId : null,
	);
	const { lowStockProducts, isLoadingLowStockProducts, lowStockErrorMessage } = useDashboardLowStock(
		hasValidCompany ? companyId : null,
	);

	const hasLowStockAlerts = lowStockProducts.length > 0;
	const hasAnyError = Boolean(
		dailySalesErrorMessage || kdsStatusErrorMessage || topProductsErrorMessage || lowStockErrorMessage,
	);

	const errorMessage = useMemo(() => {
		return dailySalesErrorMessage || kdsStatusErrorMessage || topProductsErrorMessage || lowStockErrorMessage;
	}, [dailySalesErrorMessage, kdsStatusErrorMessage, topProductsErrorMessage, lowStockErrorMessage]);

	return (
		<div className="flex h-full w-full flex-col gap-5 pb-6">
			<div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Badge variant="info">Dashboard</Badge>
						<Badge variant="outline">Analisis diario</Badge>
					</div>
					<Title as="h1">Resumen operativo</Title>
					<p className="max-w-3xl text-sm text-muted-foreground">
						Consulta ventas del dia, estado KDS, productos mas vendidos y alertas de inventario.
					</p>
				</div>
			</div>

			{!hasValidCompany ? (
				<Alert>
					<CircleAlert className="size-4" />
					<AlertTitle>Compania requerida</AlertTitle>
					<AlertDescription>Selecciona una compania para consultar los indicadores del dashboard.</AlertDescription>
				</Alert>
			) : null}

			{hasValidCompany && hasAnyError ? (
				<Alert>
					<CircleAlert className="size-4" />
					<AlertTitle>No se pudo completar la carga del dashboard</AlertTitle>
					<AlertDescription>
						{errorMessage ?? "Intenta recargar la pagina para volver a consultar los datos."}
					</AlertDescription>
				</Alert>
			) : null}

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>Total ventas del dia</CardDescription>
						<CardTitle className="flex items-center gap-2 text-3xl">
							<ShoppingCart className="size-6 text-primary" />
							<span>{isLoadingDailySales ? "Cargando..." : fCurrency(dailySales?.totalSales ?? 0)}</span>
						</CardTitle>
					</CardHeader>
				</Card>

				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>Tickets del dia</CardDescription>
						<CardTitle className="flex items-center gap-2 text-3xl">
							<Ticket className="size-6 text-primary" />
							<span>{isLoadingDailySales ? "Cargando..." : fNumber(dailySales?.ticketsCount ?? 0)}</span>
						</CardTitle>
					</CardHeader>
				</Card>

				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>Ticket promedio</CardDescription>
						<CardTitle className="flex items-center gap-2 text-3xl">
							<Clock3 className="size-6 text-primary" />
							<span>{isLoadingDailySales ? "Cargando..." : fCurrency(dailySales?.averageTicket ?? 0)}</span>
						</CardTitle>
					</CardHeader>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>KDS Pendiente</CardDescription>
						<CardTitle className="text-3xl">
							{isLoadingKdsStatus ? "..." : fNumber(kdsStatus?.pendingCount ?? 0)}
						</CardTitle>
					</CardHeader>
				</Card>

				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>KDS En preparacion</CardDescription>
						<CardTitle className="text-3xl">
							{isLoadingKdsStatus ? "..." : fNumber(kdsStatus?.preparingCount ?? 0)}
						</CardTitle>
					</CardHeader>
				</Card>

				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>KDS Listo</CardDescription>
						<CardTitle className="text-3xl">
							{isLoadingKdsStatus ? "..." : fNumber(kdsStatus?.readyCount ?? 0)}
						</CardTitle>
					</CardHeader>
				</Card>
			</div>

			<div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
				<Card className="gap-4">
					<CardHeader className="gap-2">
						<CardTitle className="flex items-center gap-2">
							<UtensilsCrossed className="size-5 text-primary" />
							Top productos vendidos
						</CardTitle>
						<CardDescription>Ranking diario generado por ventas del dia.</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoadingTopProducts ? <p className="text-sm text-muted-foreground">Cargando productos...</p> : null}
						{!isLoadingTopProducts && topProducts.length === 0 ? (
							<div className="rounded-xl border border-dashed bg-muted/20 px-6 py-8 text-center">
								<p className="text-sm font-medium text-text-primary">No hay datos de productos vendidos para hoy.</p>
							</div>
						) : null}

						{topProducts.length > 0 ? (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Producto</TableHead>
										<TableHead className="text-right">Cantidad</TableHead>
										<TableHead className="text-right">Precio</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{topProducts.map((product) => (
										<TableRow key={product.productId}>
											<TableCell>
												<div className="flex flex-col">
													<Text variant="subTitle2">{product.productName}</Text>
													<Text variant="caption" color="secondary">
														Categoria #{product.categoryId}
													</Text>
												</div>
											</TableCell>
											<TableCell className="text-right">{fNumber(product.totalQuantity)}</TableCell>
											<TableCell className="text-right">{fCurrency(product.sellPrice)}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : null}
					</CardContent>
				</Card>

				<Card className="gap-4">
					<CardHeader className="gap-2">
						<CardTitle className="flex items-center gap-2">
							<Package className="size-5 text-primary" />
							Inventario critico
						</CardTitle>
						<CardDescription>Productos en estado sin stock o stock bajo.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{hasLowStockAlerts ? (
							<AlertInv
								title="Hay productos con stock critico"
								description="Revisa inventario para evitar quiebres durante la operacion diaria."
							/>
						) : null}

						{isLoadingLowStockProducts ? (
							<p className="text-sm text-muted-foreground">Cargando alertas de stock...</p>
						) : null}

						{!isLoadingLowStockProducts && lowStockProducts.length === 0 ? (
							<div className="rounded-xl border border-dashed bg-muted/20 px-6 py-8 text-center">
								<p className="text-sm font-medium text-text-primary">No existen alertas de stock para hoy.</p>
							</div>
						) : null}

						{lowStockProducts.length > 0 ? (
							<div className="space-y-3">
								{lowStockProducts.map((item) => (
									<div key={item.productId} className="rounded-lg border p-3">
										<div className="flex items-start justify-between gap-2">
											<div>
												<p className="text-sm font-medium text-text-primary">{item.productName}</p>
												<p className="text-xs text-muted-foreground">
													Stock: {fNumber(item.totalStock)} / Reorden: {fNumber(item.reorderLevel)}
												</p>
											</div>
											<Badge variant={getStockStateVariant(item.stockState)}>
												{getStockStateLabel(item.stockState)}
											</Badge>
										</div>
									</div>
								))}
							</div>
						) : null}

						{lowStockProducts.length > 0 ? (
							<p className="flex items-center gap-2 text-xs text-muted-foreground">
								<TriangleAlert className="size-3.5" />
								Prioriza reposicion para productos Sin stock antes de cierre de caja.
							</p>
						) : null}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
