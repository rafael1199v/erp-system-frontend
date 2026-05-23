import { ArrowLeft, CircleAlert, Printer, ShoppingBasket } from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useSelectedCompanyCen } from "@/store/companyStore";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Title } from "@/ui/typography";
import { fCurrency } from "@/utils/format-number";
import OrderDetailItemCard from "../../components/OrderDetailItemCard";
import ProductCatalogItemCard from "../../components/ProductCatalogItemCard";
import { canCancelFromPos, getOrderDetailStatusLabel, normalizeOrderDetailStatus, OrderDetailStatus } from "../../enums/kds";
import { canCancelOrder, getOrderStatusBadgeVariant, getOrderStatusLabel } from "../../enums/order";
import { extractCancelOrderApiError, useCancelRestaurantOrder } from "../../hooks/use-cancel-restaurant-order";
import { useOrderDetail } from "../../hooks/use-order-detail";
import { useResendOrderDetail } from "../../hooks/use-resend-order-detail";
import { useRestaurantOrderPdf } from "../../hooks/use-restaurant-order-pdf";
import type { SalesCatalogProduct, TicketItem } from "../../types/order-detail";
import type { TicketLocationState } from "../../types/order";

const isEditableTicketItem = (item: TicketItem) => {
	const status = normalizeOrderDetailStatus(item.status);
	return status === OrderDetailStatus.Created || status === OrderDetailStatus.Preparing;
};

const isMergeableTicketItem = (item: TicketItem, productCen: string) => {
	return item.productCen === productCen && normalizeOrderDetailStatus(item.status) === OrderDetailStatus.Created && !item.sentAt;
};

export default function OrderDetailPage() {
	const navigate = useNavigate();
	const { state } = useLocation() as { state: TicketLocationState | null };
	const params = useParams<{ ticketCen: string }>();
	const ticketCen = params.ticketCen ?? "";
	const hasValidTicket = ticketCen.trim() !== "";
	const selectedCompanyCen = useSelectedCompanyCen();
	const companyCen = selectedCompanyCen ?? "";
	const hasValidCompany = companyCen.trim() !== "";

	const {
		products,
		isLoadingProducts,
		hasProductsError,
		createTicketItem,
		updateTicketItem,
		cancelTicketItem,
		ticketItems,
		ticketTotals,
		sendTicketToKds,
	} = useOrderDetail({
		companyCen: hasValidCompany ? companyCen : null,
		ticketCen: hasValidTicket ? ticketCen : null,
		enabled: hasValidCompany && hasValidTicket,
	});

	const { resendTicketItem } = useResendOrderDetail({
		companyCen: hasValidCompany ? companyCen : null,
		ticketCen: hasValidTicket ? ticketCen : null,
	});
	const orderPdfQuery = useRestaurantOrderPdf({
		companyCen: hasValidCompany ? companyCen : null,
		ticketCen: hasValidTicket ? ticketCen : null,
	});
	const { cancelTicket, isCancelingTicket } = useCancelRestaurantOrder();

	const [draftQuantities, setDraftQuantities] = useState<Record<string, number>>({});
	const [notesByItemCen, setNotesByItemCen] = useState<Record<string, string>>({});
	const [activeItemOrder, setActiveItemOrder] = useState<string[]>([]);
	const [pendingAddProductCens, setPendingAddProductCens] = useState<Set<string>>(new Set());
	const [pendingUpdateItemCens, setPendingUpdateItemCens] = useState<Set<string>>(new Set());
	const [pendingSaveNoteItemCens, setPendingSaveNoteItemCens] = useState<Set<string>>(new Set());
	const [pendingCancelItemCens, setPendingCancelItemCens] = useState<Set<string>>(new Set());
	const [pendingResendItemCens, setPendingResendItemCens] = useState<Set<string>>(new Set());
	const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

	const ticketStatus = state?.ticket?.status;
	const allowCancelTicket = canCancelOrder(ticketStatus);

	useEffect(() => {
		const nextNotes: Record<string, string> = {};
		for (const item of ticketItems) {
			nextNotes[item.ticketItemCen] = item.note ?? "";
		}
		setNotesByItemCen(nextNotes);
	}, [ticketItems]);

	const sortedProducts = useMemo(() => {
		return [...products].sort((left, right) => left.name.localeCompare(right.name));
	}, [products]);

	const rawActiveItems = useMemo(() => {
		return ticketItems.filter((item) => normalizeOrderDetailStatus(item.status) !== OrderDetailStatus.Canceled);
	}, [ticketItems]);

	useEffect(() => {
		setActiveItemOrder((previousOrder) => {
			const activeItemCens = new Set(rawActiveItems.map((item) => item.ticketItemCen));
			const nextOrder = previousOrder.filter((ticketItemCen) => activeItemCens.has(ticketItemCen));
			const orderedItemCens = new Set(nextOrder);

			for (const item of rawActiveItems) {
				if (!orderedItemCens.has(item.ticketItemCen)) {
					nextOrder.push(item.ticketItemCen);
				}
			}

			return nextOrder;
		});
	}, [rawActiveItems]);

	const activeItems = useMemo(() => {
		const activeItemsByCen = new Map(rawActiveItems.map((item) => [item.ticketItemCen, item]));
		const orderedItems = activeItemOrder
			.map((ticketItemCen) => activeItemsByCen.get(ticketItemCen))
			.filter((item): item is TicketItem => Boolean(item));
		const orderedItemCens = new Set(orderedItems.map((item) => item.ticketItemCen));
		const newItems = rawActiveItems.filter((item) => !orderedItemCens.has(item.ticketItemCen));

		return [...orderedItems, ...newItems];
	}, [activeItemOrder, rawActiveItems]);

	const subtotal = ticketTotals?.subtotal ?? activeItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
	const taxAmount = ticketTotals?.taxAmount ?? 0;
	const total = ticketTotals?.total ?? subtotal + (subtotal * taxAmount) / 100;
	
	const getDraftQuantity = (productCen: string) => draftQuantities[productCen] ?? 1;

	const setDraftQuantity = (productCen: string, nextValue: number) => {
		setDraftQuantities((previous) => ({
			...previous,
			[productCen]: Number.isFinite(nextValue) && nextValue > 0 ? Math.floor(nextValue) : 1,
		}));
	};

	const setPending = (setter: Dispatch<SetStateAction<Set<string>>>, cen: string, isPending: boolean) => {
		setter((previous) => {
			const next = new Set(previous);
			if (isPending) {
				next.add(cen);
			} else {
				next.delete(cen);
			}
			return next;
		});
	};

	const getItemNotePayload = (item: TicketItem) => {
		return (notesByItemCen[item.ticketItemCen] ?? item.note ?? "").trim() || null;
	};

	const validateProduct = (product: SalesCatalogProduct, requestedQuantity: number) => {
		if (!product.isAvailable || product.availableQuantity <= 0) {
			toast.error(`${product.name} no esta disponible para agregar.`);
			return false;
		}

		if (requestedQuantity <= 0) {
			toast.error("La cantidad debe ser mayor a cero.");
			return false;
		}

		if (requestedQuantity > product.availableQuantity) {
			toast.error(`Solo hay ${product.availableQuantity} unidades disponibles para ${product.name}.`);
			return false;
		}

		return true;
	};

	const handleAddProduct = async (product: SalesCatalogProduct) => {
		if (pendingAddProductCens.has(product.productCen)) {
			return;
		}

		const requestedQuantity = getDraftQuantity(product.productCen);
		const mergeTarget = activeItems.find((item) => isMergeableTicketItem(item, product.productCen));
		const finalQuantity = (mergeTarget?.quantity ?? 0) + requestedQuantity;
		const quantityToValidate = mergeTarget ? finalQuantity : requestedQuantity;

		if (!validateProduct(product, quantityToValidate)) {
			return;
		}

		if (mergeTarget && pendingUpdateItemCens.has(mergeTarget.ticketItemCen)) {
			return;
		}

		setPending(setPendingAddProductCens, product.productCen, true);
		if (mergeTarget) {
			setPending(setPendingUpdateItemCens, mergeTarget.ticketItemCen, true);
		}
		try {
			if (mergeTarget) {
				await updateTicketItem({
					ticketItemCen: mergeTarget.ticketItemCen,
					quantity: finalQuantity,
					note: getItemNotePayload(mergeTarget),
				});
				toast.success(`${product.name} sumado al item pendiente.`);
			} else {
				await createTicketItem({
					productCen: product.productCen,
					quantity: requestedQuantity,
					note: null,
				});
				toast.success(`${product.name} agregado correctamente.`);
			}
		} finally {
			if (mergeTarget) {
				setPending(setPendingUpdateItemCens, mergeTarget.ticketItemCen, false);
			}
			setPending(setPendingAddProductCens, product.productCen, false);
		}
	};

	const updateItemQuantity = async (item: TicketItem, product: SalesCatalogProduct | undefined, delta: 1 | -1) => {
		if (pendingUpdateItemCens.has(item.ticketItemCen)) {
			return;
		}

		if (!isEditableTicketItem(item)) {
			toast.error("Este item no se puede editar porque ya fue enviado o finalizado.");
			return;
		}

		const nextQuantity = item.quantity + delta;
		if (nextQuantity <= 0) {
			toast.error("La cantidad minima es 1. Para quitarlo, usa cancelar item.");
			return;
		}

		if (product && nextQuantity > product.availableQuantity) {
			toast.error(`No puedes superar ${product.availableQuantity} unidades para ${product.name}.`);
			return;
		}

		setPending(setPendingUpdateItemCens, item.ticketItemCen, true);
		try {
			await updateTicketItem({
				ticketItemCen: item.ticketItemCen,
				quantity: nextQuantity,
				note: getItemNotePayload(item),
			});
		} finally {
			setPending(setPendingUpdateItemCens, item.ticketItemCen, false);
		}
	};

	const handleCancelItem = async (item: TicketItem) => {
		if (pendingCancelItemCens.has(item.ticketItemCen)) {
			return;
		}

		if (!canCancelFromPos(item.status)) {
			toast.error("Solo se pueden cancelar items en estado Pendiente.");
			return;
		}

		setPending(setPendingCancelItemCens, item.ticketItemCen, true);
		try {
			await cancelTicketItem({
				ticketItemCen: item.ticketItemCen,
				status: OrderDetailStatus.Canceled,
			});
			toast.success(`${item.productName} cancelado correctamente.`);
		} catch {
			toast.error("No se pudo cancelar el item. Intenta nuevamente.");
		} finally {
			setPending(setPendingCancelItemCens, item.ticketItemCen, false);
		}
	};

	const handleSaveNote = async (item: TicketItem) => {
		if (pendingUpdateItemCens.has(item.ticketItemCen) || pendingSaveNoteItemCens.has(item.ticketItemCen)) {
			return;
		}

		if (!isEditableTicketItem(item)) {
			toast.error("Este item no se puede editar porque ya fue enviado o finalizado.");
			return;
		}

		setPending(setPendingSaveNoteItemCens, item.ticketItemCen, true);
		try {
			await updateTicketItem({
				ticketItemCen: item.ticketItemCen,
				quantity: item.quantity,
				note: getItemNotePayload(item),
			});
			toast.success(`Nota guardada para ${item.productName}.`);
		} finally {
			setPending(setPendingSaveNoteItemCens, item.ticketItemCen, false);
		}
	};

	const handleResendItem = async (item: TicketItem) => {
		if (pendingResendItemCens.has(item.ticketItemCen)) {
			return;
		}

		if (!item.sentAt || normalizeOrderDetailStatus(item.status) === OrderDetailStatus.Canceled) {
			toast.error("Solo se pueden reenviar items enviados que no esten cancelados.");
			return;
		}

		setPending(setPendingResendItemCens, item.ticketItemCen, true);
		try {
			await resendTicketItem(item.ticketItemCen);
			toast.success(`Comanda reenviada para ${item.productName}.`);
		} catch {
			toast.error("No se pudo reenviar la comanda. Intenta nuevamente.");
		} finally {
			setPending(setPendingResendItemCens, item.ticketItemCen, false);
		}
	};

	const handlePrintTicket = async () => {
		try {
			const { data: blob } = await orderPdfQuery.refetch();
			if (!blob) return;
			const url = URL.createObjectURL(blob);
			window.open(url, "_blank");
			URL.revokeObjectURL(url);
		} catch {
			toast.error("Error al reimprimir el ticket.");
		}
	};

	const handleConfirmTicketCancellation = async () => {
		if (!hasValidCompany || !hasValidTicket) {
			return;
		}

		try {
			await cancelTicket({ companyCen, ticketCen });
			toast.success("Cuenta cancelada correctamente.");
			setIsCancelDialogOpen(false);
			navigate("/sales/tickets");
		} catch (error) {
			const backendError = extractCancelOrderApiError(error);
			toast.error(backendError ?? "No se pudo cancelar la cuenta. Intenta nuevamente.");
		}
	};

	if (!hasValidTicket) {
		return (
			<Alert>
				<CircleAlert className="size-4" />
				<AlertTitle>Ticket invalido</AlertTitle>
				<AlertDescription>No se encontro un identificador CEN valido para el ticket seleccionado.</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="flex h-full w-full flex-col gap-5 pb-6">
			<div className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
				<div>
					<div className="flex items-center gap-2">
						<Badge variant="info">Punto de venta</Badge>
						<Badge variant="outline">Detalle de ticket</Badge>
						{ticketStatus ? (
							<Badge variant={getOrderStatusBadgeVariant(ticketStatus)}>{getOrderStatusLabel(ticketStatus)}</Badge>
						) : null}
					</div>
					<Title as="h1" className="mt-2">
						Ticket #{state?.ticket?.dailyNumber ?? ticketCen}
					</Title>
					<p className="mt-1 text-sm text-muted-foreground">
						Gestiona productos, cantidades y notas de cocina con identificadores CEN.
					</p>
				</div>

				<div className="flex flex-col gap-2 lg:items-end">
					<Button variant="outline" onClick={() => navigate("/sales/tickets")} className="w-full">
						<ArrowLeft className="size-4" />
						Volver a tickets
					</Button>
					<Button variant="outline" onClick={() => void handlePrintTicket()} className="w-full">
						<Printer className="size-4" />
						Reimprimir
					</Button>
					{allowCancelTicket ? (
						<Button variant="destructive" onClick={() => setIsCancelDialogOpen(true)} className="w-full">
							Cancelar cuenta
						</Button>
					) : null}
				</div>
			</div>

			{!hasValidCompany ? (
				<Alert>
					<CircleAlert className="size-4" />
					<AlertTitle>Compania requerida</AlertTitle>
					<AlertDescription>Selecciona una compania para consultar el ticket.</AlertDescription>
				</Alert>
			) : null}

			{hasProductsError ? (
				<Alert>
					<CircleAlert className="size-4" />
					<AlertTitle>Error al cargar productos</AlertTitle>
					<AlertDescription>Intenta recargar la pagina para volver a consultar el catalogo.</AlertDescription>
				</Alert>
			) : null}

			<div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
				<div className="space-y-5">
					<Card>
						<CardHeader>
							<CardTitle>Items seleccionados</CardTitle>
							<CardDescription>Modifica cantidades, notas y reenvia comandas ya enviadas.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{activeItems.length === 0 ? (
								<div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
									<p className="text-sm font-medium text-text-primary">No hay productos en este ticket.</p>
									<p className="mt-2 text-sm text-muted-foreground">Agrega productos desde el catalogo.</p>
								</div>
							) : (
								<div className="space-y-3">
									{activeItems.map((item) => {
										const product = products.find((candidate) => candidate.productCen === item.productCen);
										const itemSubtotal = item.quantity * item.unitPrice;
										const isUpdatePending = pendingUpdateItemCens.has(item.ticketItemCen);

										return (
											<OrderDetailItemCard
												key={item.ticketItemCen}
												item={{ ...item, note: notesByItemCen[item.ticketItemCen] ?? item.note }}
												product={product}
												statusLabel={getOrderDetailStatusLabel(item.status)}
												itemSubtotal={itemSubtotal}
												isEditable={isEditableTicketItem(item)}
												canCancel={canCancelFromPos(item.status)}
												canResend={Boolean(item.sentAt) && normalizeOrderDetailStatus(item.status) !== OrderDetailStatus.Canceled}
												isUpdatingOrderDetail={isUpdatePending}
												isCancelingOrderDetail={pendingCancelItemCens.has(item.ticketItemCen)}
												isResendingOrderDetail={pendingResendItemCens.has(item.ticketItemCen)}
												isCancelPending={pendingCancelItemCens.has(item.ticketItemCen)}
												isResendPending={pendingResendItemCens.has(item.ticketItemCen)}
												isSaveNotePending={pendingSaveNoteItemCens.has(item.ticketItemCen)}
												onDecreaseQuantity={() => void updateItemQuantity(item, product, -1)}
												onIncreaseQuantity={() => void updateItemQuantity(item, product, 1)}
												onCancelItem={() => void handleCancelItem(item)}
												onResendItem={() => void handleResendItem(item)}
												onNoteChange={(note) => {
													setNotesByItemCen((previous) => ({ ...previous, [item.ticketItemCen]: note }));
												}}
												onSaveNote={() => void handleSaveNote(item)}
											/>
										);
									})}
								</div>
							)}

							<Button
								className="w-full"
								onClick={async () => {
									await sendTicketToKds();
									toast.success("Orden enviada a los equipos correspondientes.");
								}}
								disabled={activeItems.length === 0 || activeItems.every((item) => item.sentAt)}
							>
								Enviar orden
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Totales del ticket</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Subtotal</span>
								<span className="font-medium">{fCurrency(subtotal)}</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Impuesto</span>
								<span className="font-medium">{taxAmount}%</span>
							</div>
							<div className="h-px bg-border" />
							<div className="flex items-center justify-between text-base font-semibold">
								<span>Total</span>
								<span>{fCurrency(total)}</span>
							</div>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ShoppingBasket className="size-5 text-primary" />
							Catalogo de productos
						</CardTitle>
						<CardDescription>Selecciona productos vendibles del catalogo Sales/Inventory.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{isLoadingProducts && sortedProducts.length === 0 ? (
							<p className="text-sm text-muted-foreground">Cargando catalogo...</p>
						) : null}
						{sortedProducts.map((product) => (
							<ProductCatalogItemCard
								key={product.productCen}
								product={product}
								draftQuantity={getDraftQuantity(product.productCen)}
								isAddPending={pendingAddProductCens.has(product.productCen)}
								onDraftQuantityChange={(value) => setDraftQuantity(product.productCen, value)}
								onAddProduct={() => void handleAddProduct(product)}
							/>
						))}
					</CardContent>
				</Card>
			</div>

			<Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Cancelar cuenta</DialogTitle>
						<DialogDescription>Esta accion cancelara la cuenta y todos sus items. Deseas continuar?</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsCancelDialogOpen(false)} disabled={isCancelingTicket}>
							Cerrar
						</Button>
						<Button variant="destructive" onClick={() => void handleConfirmTicketCancellation()} disabled={isCancelingTicket}>
							{isCancelingTicket ? "Cancelando..." : "Confirmar cancelacion"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
