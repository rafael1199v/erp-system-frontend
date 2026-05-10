import { CircleAlert, FlameKindling, Package, PackageCheck, PackageX, ReceiptText, TriangleAlert } from "lucide-react";
import { useSelectedCompanyCen } from "@/store/companyStore";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Title } from "@/ui/typography";
import { fCurrency, fNumber } from "@/utils/format-number";
import { useDashboardDailySales } from "../../hooks/use-dashboard-daily-sales";
import { useDashboardInventorySummary } from "../../hooks/use-dashboard-inventory-summary";
import { useDashboardKdsStatus } from "../../hooks/use-dashboard-kds-status";
import { useDashboardLowStock } from "../../hooks/use-dashboard-low-stock";
import { useDashboardTopProducts } from "../../hooks/use-dashboard-top-products";

export default function DashboardAnalysisPage() {
	const companyCen = useSelectedCompanyCen();
	const hasCompany = Boolean(companyCen?.trim());

	const { dailySales, isLoadingDailySales, isErrorDailySales, dailySalesErrorMessage } =
		useDashboardDailySales(companyCen);
	const { topProducts, isLoadingTopProducts, isErrorTopProducts, topProductsErrorMessage } =
		useDashboardTopProducts(companyCen, 10);
	const { kdsStatus, isLoadingKdsStatus, isErrorKdsStatus, kdsStatusErrorMessage } =
		useDashboardKdsStatus(companyCen);
	const {
		lowStockProducts,
		isLoadingLowStockProducts,
		isErrorLowStockProducts,
		lowStockErrorMessage,
	} = useDashboardLowStock(companyCen);
	const {
		inventorySummary,
		isLoadingInventorySummary,
		isErrorInventorySummary,
		inventorySummaryErrorMessage,
	} = useDashboardInventorySummary(companyCen);

	const isLoadingSummary = isLoadingDailySales || isLoadingInventorySummary || isLoadingKdsStatus;
	const criticalProducts = lowStockProducts.slice(0, 6);

	return (
		<div className="flex h-full w-full flex-col gap-5 pb-6">
			<div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Badge variant="info">Dashboard</Badge>
						<Badge variant="outline">Ventas e inventario CEN</Badge>
					</div>
					<Title as="h1">Resumen operativo</Title>
					<p className="max-w-3xl text-sm text-muted-foreground">
						Consulta ventas del dia, preparacion KDS, productos mas vendidos y alertas criticas de inventario.
					</p>
				</div>
			</div>

			{!hasCompany ? (
				<Alert>
					<CircleAlert className="size-4" />
					<AlertTitle>Compania requerida</AlertTitle>
					<AlertDescription>Selecciona una compania para consultar los indicadores del dashboard.</AlertDescription>
				</Alert>
			) : null}

			{isErrorDailySales || isErrorInventorySummary || isErrorKdsStatus ? (
				<Alert>
					<CircleAlert className="size-4" />
					<AlertTitle>No se pudieron cargar todos los indicadores</AlertTitle>
					<AlertDescription>
						{dailySalesErrorMessage ?? inventorySummaryErrorMessage ?? kdsStatusErrorMessage ?? "Intenta recargar la pagina."}
					</AlertDescription>
				</Alert>
			) : null}

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>Ventas del dia</CardDescription>
						<CardTitle className="flex items-center gap-2 text-3xl">
							<ReceiptText className="size-6 text-primary" />
							<span>{isLoadingSummary ? "..." : fCurrency(dailySales?.totalSales ?? 0)}</span>
						</CardTitle>
					</CardHeader>
				</Card>
				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>Tickets cobrados</CardDescription>
						<CardTitle className="text-3xl">{isLoadingSummary ? "..." : fNumber(dailySales?.ticketsCount ?? 0)}</CardTitle>
					</CardHeader>
				</Card>
				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>Ticket promedio</CardDescription>
						<CardTitle className="text-3xl">{isLoadingSummary ? "..." : fCurrency(dailySales?.averageTicket ?? 0)}</CardTitle>
					</CardHeader>
				</Card>
				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>Items en preparacion</CardDescription>
						<CardTitle className="flex items-center gap-2 text-3xl">
							<FlameKindling className="size-6 text-warning" />
							<span>{isLoadingSummary ? "..." : fNumber(kdsStatus?.preparingCount ?? 0)}</span>
						</CardTitle>
					</CardHeader>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>Total productos</CardDescription>
						<CardTitle className="flex items-center gap-2 text-3xl">
							<Package className="size-6 text-primary" />
							<span>{isLoadingInventorySummary ? "..." : fNumber(inventorySummary?.totalProducts ?? 0)}</span>
						</CardTitle>
					</CardHeader>
				</Card>
				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>Stock disponible</CardDescription>
						<CardTitle className="flex items-center gap-2 text-3xl">
							<PackageCheck className="size-6 text-primary" />
							<span>{isLoadingInventorySummary ? "..." : fNumber(inventorySummary?.totalStockQuantity ?? 0)}</span>
						</CardTitle>
					</CardHeader>
				</Card>
				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>Stock bajo</CardDescription>
						<CardTitle className="flex items-center gap-2 text-3xl">
							<TriangleAlert className="size-6 text-warning" />
							<span>{isLoadingInventorySummary ? "..." : fNumber(inventorySummary?.lowStockCount ?? 0)}</span>
						</CardTitle>
					</CardHeader>
				</Card>
				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>Sin stock</CardDescription>
						<CardTitle className="flex items-center gap-2 text-3xl">
							<PackageX className="size-6 text-destructive" />
							<span>{isLoadingInventorySummary ? "..." : fNumber(inventorySummary?.outOfStockCount ?? 0)}</span>
						</CardTitle>
					</CardHeader>
				</Card>
			</div>

			<div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
				<Card>
					<CardHeader>
						<CardTitle>Productos mas vendidos</CardTitle>
						<CardDescription>Ranking diario enriquecido con categoria y precio de venta.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{isErrorTopProducts ? (
							<p className="text-sm text-warning">{topProductsErrorMessage ?? "No se pudieron cargar productos."}</p>
						) : null}
						{isLoadingTopProducts ? <p className="text-sm text-muted-foreground">Cargando ranking...</p> : null}
						{!isLoadingTopProducts && topProducts.length === 0 ? (
							<div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
								<p className="text-sm font-medium text-text-primary">Aun no hay ventas registradas hoy.</p>
							</div>
						) : null}
						{topProducts.map((product, index) => (
							<div key={`${product.productCen ?? product.productName}-${index}`} className="flex items-center justify-between rounded-lg border bg-muted/10 p-3">
								<div>
									<p className="font-medium text-text-primary">{product.productName}</p>
									<p className="text-sm text-muted-foreground">{product.categoryName ?? "Sin categoria"}</p>
								</div>
								<div className="text-right">
									<p className="font-semibold">{fNumber(product.totalQuantity)} uds.</p>
									<p className="text-sm text-muted-foreground">{fCurrency(product.salePrice)}</p>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Alertas de stock</CardTitle>
						<CardDescription>Productos con stock bajo o agotado derivados del endpoint CEN de stock.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{isErrorLowStockProducts ? (
							<p className="text-sm text-warning">{lowStockErrorMessage ?? "No se pudo cargar stock critico."}</p>
						) : null}
						{isLoadingLowStockProducts ? <p className="text-sm text-muted-foreground">Cargando stock...</p> : null}
						{!isLoadingLowStockProducts && criticalProducts.length === 0 ? (
							<div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
								<p className="text-sm font-medium text-text-primary">No hay alertas criticas de stock.</p>
							</div>
						) : null}
						{criticalProducts.map((product) => (
							<div key={`${product.productCen}-${product.warehouseCen}`} className="rounded-lg border bg-muted/10 p-3">
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="font-medium text-text-primary">{product.productName}</p>
										<p className="text-sm text-muted-foreground">{product.warehouseName}</p>
									</div>
									<Badge variant={product.stockState === "OUT_OF_STOCK" ? "destructive" : "warning"}>
										{product.stockState === "OUT_OF_STOCK" ? "Sin stock" : "Stock bajo"}
									</Badge>
								</div>
								<p className="mt-2 text-sm text-muted-foreground">
									Disponible: {fNumber(product.availableQuantity)} {product.unitName}
								</p>
							</div>
						))}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
