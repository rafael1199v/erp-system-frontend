import { ArrowLeft, CheckCircle2, CircleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useSelectedCompanyCen } from "@/store/companyStore";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Title } from "@/ui/typography";
import PurchaseOrderStatusBadge from "../../components/PurchaseOrderStatusBadge";
import { usePurchaseSuppliers, usePurchaseWarehouses } from "../../hooks/use-purchase-lookups";
import { useConfirmPurchaseOrder, usePurchaseOrderDetail } from "../../hooks/use-purchase-order-detail";
import { canConfirmPurchaseOrder, formatPurchaseDate } from "../../utils/purchase-order";

export default function PurchaseOrderDetailPage() {
	const navigate = useNavigate();
	const params = useParams<{ orderCen: string }>();
	const orderCen = params.orderCen ?? "";
	const selectedCompanyCen = useSelectedCompanyCen();
	const companyCen = selectedCompanyCen ?? "";
	const hasValidCompany = companyCen.trim() !== "";
	const hasValidOrder = orderCen.trim() !== "";
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

	const detailQuery = usePurchaseOrderDetail({
		companyCen: hasValidCompany ? companyCen : null,
		orderCen: hasValidOrder ? orderCen : null,
	});
	const suppliersQuery = usePurchaseSuppliers(hasValidCompany ? companyCen : null);
	const warehousesQuery = usePurchaseWarehouses(hasValidCompany ? companyCen : null);
	const confirmOrder = useConfirmPurchaseOrder();

	const suppliersByCen = useMemo(() => {
		return Object.fromEntries((suppliersQuery.data ?? []).map((supplier) => [supplier.supplierCen, supplier]));
	}, [suppliersQuery.data]);
	const warehousesByCen = useMemo(() => {
		return Object.fromEntries((warehousesQuery.data ?? []).map((warehouse) => [warehouse.warehouseCen, warehouse]));
	}, [warehousesQuery.data]);

	const order = detailQuery.order;
	const supplier = order ? suppliersByCen[order.supplierCen] : undefined;
	const warehouse = order ? warehousesByCen[order.warehouseCen] : undefined;
	const canConfirm = canConfirmPurchaseOrder(order?.status);

	const handleConfirmOrder = async () => {
		if (!hasValidCompany || !hasValidOrder || !order) {
			return;
		}

		await confirmOrder.mutateAsync({ companyCen, orderCen: order.orderCen });
		toast.success("Orden de compra confirmada correctamente.");
		setIsConfirmDialogOpen(false);
	};

	if (!hasValidOrder) {
		return (
			<Alert>
				<CircleAlert className="size-4" />
				<AlertTitle>Orden invalida</AlertTitle>
				<AlertDescription>No se encontro un identificador CEN valido para la orden seleccionada.</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="flex h-full w-full flex-col gap-5 pb-6">
			<div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
				<div className="space-y-2">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="info">Compras</Badge>
						<Badge variant="outline">Detalle de orden</Badge>
						{order ? <PurchaseOrderStatusBadge status={order.status} /> : null}
					</div>
					<Title as="h1">Orden #{order?.orderCen.slice(0, 8) ?? orderCen.slice(0, 8)}</Title>
					<p className="max-w-2xl text-sm text-muted-foreground">
						Consulta los items de compra y confirma la orden para incrementar stock en Inventory.
					</p>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row lg:items-center">
					<Button variant="outline" onClick={() => navigate("/purchases/orders")}>
						<ArrowLeft className="size-4" />
						Volver
					</Button>
					{canConfirm ? (
						<Button onClick={() => setIsConfirmDialogOpen(true)} disabled={confirmOrder.isPending}>
							<CheckCircle2 className="size-4" />
							Confirmar orden
						</Button>
					) : null}
				</div>
			</div>

			{!hasValidCompany ? (
				<Alert>
					<CircleAlert className="size-4" />
					<AlertTitle>Compania requerida</AlertTitle>
					<AlertDescription>Selecciona una compania para consultar la orden de compra.</AlertDescription>
				</Alert>
			) : null}

			{detailQuery.isError ? (
				<Alert>
					<CircleAlert className="size-4" />
					<AlertTitle>Error al cargar la orden</AlertTitle>
					<AlertDescription>Intenta recargar la pagina para consultar el detalle nuevamente.</AlertDescription>
				</Alert>
			) : null}

			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="gap-1">
						<CardDescription>Proveedor</CardDescription>
						<CardTitle className="text-base">{supplier?.name ?? order?.supplierCen.slice(0, 8) ?? "..."}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="gap-1">
						<CardDescription>Almacen</CardDescription>
						<CardTitle className="text-base">{warehouse?.name ?? order?.warehouseCen.slice(0, 8) ?? "..."}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="gap-1">
						<CardDescription>Creada</CardDescription>
						<CardTitle className="text-base">{formatPurchaseDate(order?.createdAt)}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="gap-1">
						<CardDescription>Confirmada</CardDescription>
						<CardTitle className="text-base">{formatPurchaseDate(order?.confirmedAt)}</CardTitle>
					</CardHeader>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Items de la orden</CardTitle>
					<CardDescription>Los nombres y unidades se resuelven desde Inventory solo para visualizacion.</CardDescription>
				</CardHeader>
				<CardContent>
					{detailQuery.isLoading ? (
						<p className="text-sm text-muted-foreground">Cargando detalle...</p>
					) : null}

					{order && order.items.length === 0 ? (
						<div className="rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
							<p className="text-sm font-medium text-text-primary">Esta orden no tiene productos registrados.</p>
						</div>
					) : null}

					{order && order.items.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Producto</TableHead>
									<TableHead>SKU</TableHead>
									<TableHead>Unidad</TableHead>
									<TableHead>Cantidad</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{order.items.map((item) => {
									const product = detailQuery.productsByCen[item.productCen];

									return (
										<TableRow key={item.productCen}>
											<TableCell className="font-medium">{product?.name ?? item.productCen.slice(0, 8)}</TableCell>
											<TableCell>{product?.sku ?? "-"}</TableCell>
											<TableCell>{product?.unitName ?? "-"}</TableCell>
											<TableCell>{item.quantity}</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					) : null}
				</CardContent>
			</Card>

			<Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirmar orden de compra</DialogTitle>
						<DialogDescription>
							Esta accion incrementara el stock de los productos en el almacen seleccionado. Deseas continuar?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)} disabled={confirmOrder.isPending}>
							Cerrar
						</Button>
						<Button onClick={() => void handleConfirmOrder()} disabled={confirmOrder.isPending}>
							{confirmOrder.isPending ? "Confirmando..." : "Confirmar"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
