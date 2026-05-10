import { CircleAlert, Eye, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useSelectedCompanyCen } from "@/store/companyStore";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Title } from "@/ui/typography";
import PurchaseOrderStatusBadge from "../../components/PurchaseOrderStatusBadge";
import PurchasePagination from "../../components/PurchasePagination";
import { usePurchaseSuppliers } from "../../hooks/use-purchase-lookups";
import { usePurchaseOrders } from "../../hooks/use-purchase-orders";
import type { PurchaseOrderStatus } from "../../types/purchase";
import { formatPurchaseDate } from "../../utils/purchase-order";

const pageSize = 20;
const allStatusesValue = "all";

export default function PurchaseOrdersPage() {
	const navigate = useNavigate();
	const selectedCompanyCen = useSelectedCompanyCen();
	const companyCen = selectedCompanyCen ?? "";
	const hasValidCompany = companyCen.trim() !== "";
	const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | typeof allStatusesValue>(allStatusesValue);
	const [page, setPage] = useState(1);

	const ordersQuery = usePurchaseOrders({
		companyCen: hasValidCompany ? companyCen : null,
		query: {
			status: statusFilter === allStatusesValue ? undefined : statusFilter,
			page,
			pageSize,
			sortDescending: true,
		},
	});
	const suppliersQuery = usePurchaseSuppliers(hasValidCompany ? companyCen : null);

	const suppliersByCen = useMemo(() => {
		return Object.fromEntries((suppliersQuery.data ?? []).map((supplier) => [supplier.supplierCen, supplier]));
	}, [suppliersQuery.data]);

	const orders = ordersQuery.data?.items ?? [];
	const totalPages = ordersQuery.data?.totalPages ?? 1;
	const totalCount = ordersQuery.data?.totalCount ?? 0;
	const pendingCount = orders.filter((order) => order.status === "Pending").length;

	const handleStatusChange = (value: string) => {
		setStatusFilter(value as PurchaseOrderStatus | typeof allStatusesValue);
		setPage(1);
	};

	return (
		<div className="flex h-full w-full flex-col gap-5 pb-6">
			<div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Badge variant="info">Compras</Badge>
						<Badge variant="outline">Ordenes de compra</Badge>
					</div>
					<Title as="h1">Ordenes de compra</Title>
					<p className="max-w-2xl text-sm text-muted-foreground">
						Crea, consulta y confirma ordenes usando CENs publicos para proveedores, almacenes y productos.
					</p>
				</div>

				<Button onClick={() => navigate("/purchases/orders/new")} disabled={!hasValidCompany}>
					<Plus className="size-4" />
					Nueva orden
				</Button>
			</div>

			{!hasValidCompany ? (
				<Alert>
					<CircleAlert className="size-4" />
					<AlertTitle>Compania requerida</AlertTitle>
					<AlertDescription>Selecciona una compania para consultar ordenes de compra.</AlertDescription>
				</Alert>
			) : null}

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="gap-1">
						<CardDescription>Total encontrado</CardDescription>
						<CardTitle className="text-3xl">{ordersQuery.isLoading ? "..." : totalCount}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="gap-1">
						<CardDescription>Pendientes en pagina</CardDescription>
						<CardTitle className="text-3xl">{ordersQuery.isLoading ? "..." : pendingCount}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="gap-1">
						<CardDescription>Proveedores disponibles</CardDescription>
						<CardTitle className="text-3xl">{suppliersQuery.data?.length ?? 0}</CardTitle>
					</CardHeader>
				</Card>
			</div>

			<Card>
				<CardHeader className="gap-3">
					<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
						<div>
							<CardTitle>Listado de ordenes</CardTitle>
							<CardDescription>Filtra por estado y abre el detalle para confirmar una orden pendiente.</CardDescription>
						</div>
						<Select value={statusFilter} onValueChange={handleStatusChange} disabled={!hasValidCompany}>
							<SelectTrigger className="w-full lg:w-[220px]">
								<SelectValue placeholder="Filtrar por estado" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={allStatusesValue}>Todos los estados</SelectItem>
								<SelectItem value="Pending">Pendientes</SelectItem>
								<SelectItem value="Confirmed">Confirmadas</SelectItem>
								<SelectItem value="Cancelled">Canceladas</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{ordersQuery.isError ? (
						<Alert>
							<CircleAlert className="size-4" />
							<AlertTitle>Error al cargar ordenes</AlertTitle>
							<AlertDescription>Intenta recargar la pagina para consultar compras nuevamente.</AlertDescription>
						</Alert>
					) : null}

					{hasValidCompany && !ordersQuery.isLoading && orders.length === 0 ? (
						<div className="rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
							<p className="text-sm font-medium text-text-primary">No hay ordenes de compra para mostrar.</p>
							<p className="mt-2 text-sm text-muted-foreground">Usa Nueva orden para registrar la primera compra.</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Orden</TableHead>
									<TableHead>Proveedor</TableHead>
									<TableHead>Estado</TableHead>
									<TableHead>Items</TableHead>
									<TableHead>Creada</TableHead>
									<TableHead>Confirmada</TableHead>
									<TableHead className="text-right">Acciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{orders.map((order) => (
									<TableRow key={order.orderCen}>
										<TableCell className="font-medium">{order.orderCen.slice(0, 8)}</TableCell>
										<TableCell>{suppliersByCen[order.supplierCen]?.name ?? order.supplierCen.slice(0, 8)}</TableCell>
										<TableCell>
											<PurchaseOrderStatusBadge status={order.status} />
										</TableCell>
										<TableCell>{order.itemCount}</TableCell>
										<TableCell>{formatPurchaseDate(order.createdAt)}</TableCell>
										<TableCell>{formatPurchaseDate(order.confirmedAt)}</TableCell>
										<TableCell className="text-right">
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => navigate(`/purchases/orders/${encodeURIComponent(order.orderCen)}`)}
											>
												<Eye className="size-4" />
												Ver
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}

					<PurchasePagination
						currentPage={ordersQuery.data?.currentPage ?? page}
						totalPages={totalPages}
						totalCount={totalCount}
						isFetching={ordersQuery.isFetching}
						onPageChange={setPage}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
