import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Title } from "@/ui/typography";
import { useSelectedCompanyId } from "@/store/companyStore";
import { fCurrency } from "@/utils/format-number";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CircleAlert, CreditCard } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import orderApi from "../../api/orderApi";
import { getOrderStatusLabel, isOrderOpen } from "../../enums/order";
import { extractProcessPaymentApiError, useProcessPayment } from "../../hooks/use-process-payment";
import { useRestaurantOrders } from "../../hooks/use-pos-tickets";
import { usePaymentMethods } from "../../hooks/use-payment-methods";
import type { RestaurantOrder } from "../../types/order";
import type { StockInsufficiencyResponseDto } from "../../types/payment";
import { OrderDetailStatus } from "../../enums/kds";

type CheckoutLocationState = {
	restaurantOrder?: RestaurantOrder;
};

export default function CheckoutPage() {
	const navigate = useNavigate();
	const { state } = useLocation() as { state: CheckoutLocationState | null };
	const params = useParams<{ restaurantOrderId: string }>();
	const restaurantOrderId = Number.parseInt(params.restaurantOrderId ?? "", 10);
	const hasValidOrder = Number.isInteger(restaurantOrderId) && restaurantOrderId > 0;
	const selectedCompanyId = useSelectedCompanyId();
	const companyId = Number.parseInt(selectedCompanyId ?? "", 10);
	const hasValidCompany = Number.isInteger(companyId) && companyId > 0;

	const [selectedPaymentTypeId, setSelectedPaymentTypeId] = useState<number | null>(null);
	const [insufficiencies, setInsufficiencies] = useState<StockInsufficiencyResponseDto[]>([]);
	const [isInsufficiencyDialogOpen, setIsInsufficiencyDialogOpen] = useState(false);
	const { orders } = useRestaurantOrders(hasValidCompany ? companyId : null);

	const orderFromList = orders.find((order) => order.restaurantOrderId === restaurantOrderId);
	const orderStatusId = orderFromList?.orderStatusId ?? state?.restaurantOrder?.orderStatusId;
	const orderIsOpen = isOrderOpen(orderStatusId);

	const orderDetailsQuery = useQuery({
		queryKey: ["sales-order-details", restaurantOrderId],
		queryFn: async () => {
			const response = await orderApi.getOrderDetails(restaurantOrderId);
			return response.data;
		},
		enabled: hasValidOrder,
	});

	const orderTaxQuery = useQuery({
		queryKey: ["sales-order-tax", restaurantOrderId],
		queryFn: async () => {
			const response = await orderApi.getOrderTax(restaurantOrderId);
			return response.data;
		},
		enabled: hasValidOrder,
	});

	const { paymentMethods, isLoadingPaymentMethods, isErrorPaymentMethods } = usePaymentMethods();
	const { processPayment, isProcessingPayment } = useProcessPayment();

	const subtotal = useMemo(() => {
		return (orderDetailsQuery.data ?? [])
			.filter((orderDetail) => orderDetail.restaurantOrderStatusId !== OrderDetailStatus.Canceled)
			.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
	}, [orderDetailsQuery.data]);

	const taxRate = orderTaxQuery.data ?? 0;
	const taxAmount = subtotal * (taxRate / 100);
	const total = subtotal + taxAmount;

	const canProcessPayment = hasValidOrder && orderIsOpen && selectedPaymentTypeId !== null && !isProcessingPayment;

	const handleProcessPayment = async () => {
		if (!hasValidOrder || selectedPaymentTypeId === null) {
			return;
		}

		if (!orderIsOpen) {
			toast.error("Solo se puede cobrar una cuenta abierta.");
			return;
		}

		setInsufficiencies([]);
		setIsInsufficiencyDialogOpen(false);

		try {
			const response = await processPayment({
				restaurantOrderId,
				paymentTypeId: selectedPaymentTypeId,
			});

			toast.success(`Pago procesado correctamente. Venta #${response.saleId}.`);
			navigate("/sales/orders");
		} catch (error) {
			const apiError = extractProcessPaymentApiError(error);

			if (apiError && typeof apiError !== "string" && apiError.insufficiencies.length > 0) {
				setInsufficiencies(apiError.insufficiencies);
				setIsInsufficiencyDialogOpen(true);
				return;
			}

			if (typeof apiError === "string") {
				toast.error(apiError);
				return;
			}

			if (apiError && typeof apiError !== "string" && apiError.message) {
				toast.error(apiError.message);
				return;
			}

			toast.error("No se pudo procesar el pago.");
		}
	};

	if (!hasValidOrder) {
		return (
			<Alert>
				<CircleAlert className="size-4" />
				<AlertTitle>Pedido invalido</AlertTitle>
				<AlertDescription>No se encontro un identificador valido para continuar con el cobro.</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="flex h-full w-full flex-col gap-5 pb-6">
			<div className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
				<div>
					<div className="flex items-center gap-2">
						<Badge variant="info">Punto de venta</Badge>
						<Badge variant="outline">Cobro</Badge>
					</div>
					<Title as="h1" className="mt-2">
						Cobrar pedido #{state?.restaurantOrder?.dailyNumber ?? restaurantOrderId}
					</Title>
					<p className="mt-1 text-sm text-muted-foreground">
						Selecciona el metodo de pago para cerrar la cuenta y generar la venta.
					</p>
				</div>
				<Button variant="outline" onClick={() => navigate("/sales/orders")}>
					<ArrowLeft className="size-4" />
					Volver a tickets
				</Button>
			</div>

			<div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CreditCard className="size-5 text-primary" />
							Metodo de pago
						</CardTitle>
						<CardDescription>
							Selecciona una opcion de pago. Si no hay stock suficiente, se mostrara el detalle del faltante.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{typeof orderStatusId === "number" && !orderIsOpen ? (
							<Alert>
								<CircleAlert className="size-4" />
								<AlertTitle>Cuenta no disponible para cobro</AlertTitle>
								<AlertDescription>
									Estado actual: {getOrderStatusLabel(orderStatusId)}. Solo las cuentas abiertas pueden cobrarse.
								</AlertDescription>
							</Alert>
						) : null}

						{isErrorPaymentMethods ? (
							<Alert>
								<CircleAlert className="size-4" />
								<AlertTitle>No se pudieron cargar los metodos de pago</AlertTitle>
								<AlertDescription>Intenta recargar la pagina para volver a intentarlo.</AlertDescription>
							</Alert>
						) : null}

						<div className="space-y-2">
							<p className="text-sm font-medium text-text-primary">Metodo</p>
							<Select
								value={selectedPaymentTypeId ? String(selectedPaymentTypeId) : undefined}
								onValueChange={(value) => {
									setSelectedPaymentTypeId(Number(value));
								}}
								disabled={isLoadingPaymentMethods || paymentMethods.length === 0 || isProcessingPayment}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder={isLoadingPaymentMethods ? "Cargando metodos..." : "Seleccionar metodo"} />
								</SelectTrigger>
								<SelectContent>
									{paymentMethods.map((paymentMethod) => (
										<SelectItem key={paymentMethod.id} value={String(paymentMethod.id)}>
											{paymentMethod.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<Button className="w-full" onClick={() => void handleProcessPayment()} disabled={!canProcessPayment}>
							{isProcessingPayment ? "Procesando pago..." : "Confirmar cobro"}
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Resumen del pedido</CardTitle>
						<CardDescription>Totales calculados con los items actuales del pedido.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Subtotal</span>
							<span className="font-medium">{fCurrency(subtotal)}</span>
						</div>
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Impuesto ({taxRate}%)</span>
							<span className="font-medium">{fCurrency(taxAmount)}</span>
						</div>
						<div className="h-px bg-border" />
						<div className="flex items-center justify-between text-base font-semibold">
							<span>Total</span>
							<span>{fCurrency(total)}</span>
						</div>
						{orderDetailsQuery.isError ? (
							<p className="text-xs text-warning">No se pudieron cargar los items del pedido.</p>
						) : null}
						{orderTaxQuery.isError ? (
							<p className="text-xs text-warning">No se pudo cargar el impuesto global. Se usa 0% temporalmente.</p>
						) : null}
					</CardContent>
				</Card>
			</div>

			<Dialog open={isInsufficiencyDialogOpen} onOpenChange={setIsInsufficiencyDialogOpen}>
				<DialogContent className="sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle>Stock insuficiente para completar el pago</DialogTitle>
						<DialogDescription>
							Ajusta las cantidades del pedido o repone inventario para poder continuar con el cobro.
						</DialogDescription>
					</DialogHeader>

					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Producto</TableHead>
									<TableHead className="text-right">Solicitado</TableHead>
									<TableHead className="text-right">Disponible</TableHead>
									<TableHead className="text-right">Faltante</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{insufficiencies.map((item) => {
									const missingQuantity = Math.max(item.requestedQuantity - item.availableQuantity, 0);

									return (
										<TableRow key={item.productId}>
											<TableCell>{item.productName}</TableCell>
											<TableCell className="text-right">{item.requestedQuantity}</TableCell>
											<TableCell className="text-right">{item.availableQuantity}</TableCell>
											<TableCell className="text-right font-semibold text-warning">{missingQuantity}</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setIsInsufficiencyDialogOpen(false)}>
							Cerrar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
