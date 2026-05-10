import { ArrowLeft, CircleAlert, CreditCard } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useSelectedCompanyCen } from "@/store/companyStore";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Title } from "@/ui/typography";
import { fCurrency } from "@/utils/format-number";
import { getOrderStatusLabel, isOrderOpen } from "../../enums/order";
import { useOrderDetail } from "../../hooks/use-order-detail";
import { usePaymentMethods } from "../../hooks/use-payment-methods";
import { extractProcessPaymentApiError, useProcessPayment } from "../../hooks/use-process-payment";
import { useRestaurantOrders } from "../../hooks/use-pos-tickets";
import type { TicketLocationState } from "../../types/order";
import type { StockInsufficiencyResponseDto } from "../../types/payment";

export default function CheckoutPage() {
	const navigate = useNavigate();
	const { state } = useLocation() as { state: TicketLocationState | null };
	const params = useParams<{ ticketCen: string }>();
	const ticketCen = params.ticketCen ?? "";
	const hasValidTicket = ticketCen.trim() !== "";
	const selectedCompanyCen = useSelectedCompanyCen();
	const companyCen = selectedCompanyCen ?? "";
	const hasValidCompany = companyCen.trim() !== "";

	const [selectedPaymentMethodCode, setSelectedPaymentMethodCode] = useState<string | null>(null);
	const [insufficiencies, setInsufficiencies] = useState<StockInsufficiencyResponseDto[]>([]);
	const [isInsufficiencyDialogOpen, setIsInsufficiencyDialogOpen] = useState(false);

	const { tickets } = useRestaurantOrders(hasValidCompany ? companyCen : null);
	const ticketFromList = tickets.find((ticket) => ticket.ticketCen === ticketCen);
	const ticket = ticketFromList ?? state?.ticket;
	const ticketStatus = ticket?.status;
	const ticketIsOpen = ticketStatus ? isOrderOpen(ticketStatus) : true;

	const { ticketItems, ticketTotals } = useOrderDetail({
		companyCen: hasValidCompany ? companyCen : null,
		ticketCen: hasValidTicket ? ticketCen : null,
		enabled: hasValidCompany && hasValidTicket,
	});
	const { paymentMethods, isLoadingPaymentMethods, isErrorPaymentMethods } = usePaymentMethods();
	const { processPayment, isProcessingPayment } = useProcessPayment();

	const subtotal = ticketTotals?.subtotal ?? ticketItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
	const taxAmount = ticketTotals?.taxAmount ?? 0;
	const total = ticketTotals?.total ?? subtotal + taxAmount;
	const canProcessPayment =
		hasValidCompany && hasValidTicket && ticketIsOpen && selectedPaymentMethodCode !== null && !isProcessingPayment;

	const handleProcessPayment = async () => {
		if (!canProcessPayment || selectedPaymentMethodCode === null) {
			return;
		}

		setInsufficiencies([]);
		setIsInsufficiencyDialogOpen(false);

		try {
			const response = await processPayment({
				companyCen,
				ticketCen,
				paymentMethodCode: selectedPaymentMethodCode,
			});

			const inventoryReference = response.inventoryDocumentCen ? ` Documento ${response.inventoryDocumentCen}.` : "";
			toast.success(`Pago procesado correctamente. Venta ${response.saleCen}.${inventoryReference}`);
			navigate("/sales/tickets");
		} catch (error) {
			const apiError = extractProcessPaymentApiError(error);

			if (apiError && typeof apiError !== "string") {
				const stockFailures = apiError.insufficiencies ?? apiError.requirements ?? [];
				if (stockFailures.length > 0) {
					setInsufficiencies(stockFailures);
					setIsInsufficiencyDialogOpen(true);
					return;
				}

				if (apiError.message) {
					toast.error(apiError.message);
					return;
				}
			}

			if (typeof apiError === "string") {
				toast.error(apiError);
				return;
			}

			toast.error("No se pudo procesar el pago.");
		}
	};

	if (!hasValidTicket) {
		return (
			<Alert>
				<CircleAlert className="size-4" />
				<AlertTitle>Ticket invalido</AlertTitle>
				<AlertDescription>No se encontro un CEN valido para continuar con el cobro.</AlertDescription>
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
						Cobrar ticket #{ticket?.dailyNumber ?? ticketCen}
					</Title>
					<p className="mt-1 text-sm text-muted-foreground">
						Selecciona el metodo de pago para cerrar la cuenta y generar la venta.
					</p>
				</div>
				<Button variant="outline" onClick={() => navigate("/sales/tickets")}>
					<ArrowLeft className="size-4" />
					Volver a tickets
				</Button>
			</div>

			{!hasValidCompany ? (
				<Alert>
					<CircleAlert className="size-4" />
					<AlertTitle>Compania requerida</AlertTitle>
					<AlertDescription>Selecciona una compania para continuar con el cobro.</AlertDescription>
				</Alert>
			) : null}

			<div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CreditCard className="size-5 text-primary" />
							Metodo de pago
						</CardTitle>
						<CardDescription>
							Si no hay stock suficiente, se mostrara el detalle del faltante por producto.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{ticketStatus && !ticketIsOpen ? (
							<Alert>
								<CircleAlert className="size-4" />
								<AlertTitle>Cuenta no disponible para cobro</AlertTitle>
								<AlertDescription>
									Estado actual: {getOrderStatusLabel(ticketStatus)}. Solo las cuentas abiertas pueden cobrarse.
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
								value={selectedPaymentMethodCode ?? undefined}
								onValueChange={setSelectedPaymentMethodCode}
								disabled={isLoadingPaymentMethods || paymentMethods.length === 0 || isProcessingPayment}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder={isLoadingPaymentMethods ? "Cargando metodos..." : "Seleccionar metodo"} />
								</SelectTrigger>
								<SelectContent>
									{paymentMethods
										.filter((paymentMethod) => paymentMethod.isActive)
										.map((paymentMethod) => (
											<SelectItem key={paymentMethod.paymentMethodCode} value={paymentMethod.paymentMethodCode}>
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
						<CardTitle>Resumen del ticket</CardTitle>
						<CardDescription>Totales autoritativos consultados desde Sales.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Subtotal</span>
							<span className="font-medium">{fCurrency(subtotal)}</span>
						</div>
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Impuesto</span>
							<span className="font-medium">{taxAmount} %</span>
						</div>
						<div className="h-px bg-border" />
						<div className="flex items-center justify-between text-base font-semibold">
							<span>Total</span>
							<span>{fCurrency(total)}</span>
						</div>
					</CardContent>
				</Card>
			</div>

			<Dialog open={isInsufficiencyDialogOpen} onOpenChange={setIsInsufficiencyDialogOpen}>
				<DialogContent className="sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle>Stock insuficiente para completar el pago</DialogTitle>
						<DialogDescription>
							Ajusta las cantidades del ticket o repone inventario para poder continuar con el cobro.
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
								{insufficiencies.map((item) => (
									<TableRow key={`${item.productCen ?? item.productName}-${item.warehouseCen ?? "warehouse"}`}>
										<TableCell>{item.productName}</TableCell>
										<TableCell className="text-right">{item.requestedQuantity}</TableCell>
										<TableCell className="text-right">{item.availableQuantity}</TableCell>
										<TableCell className="text-right font-semibold text-warning">{item.missingQuantity}</TableCell>
									</TableRow>
								))}
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
