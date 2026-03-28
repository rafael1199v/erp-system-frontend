import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Title } from "@/ui/typography";
import { fCurrency } from "@/utils/format-number";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, CircleAlert, Printer, ShoppingBasket } from "lucide-react";
import { canCancelFromPos, getOrderDetailStatusLabel, OrderDetailStatus } from "../../enums/kds";
import { canCancelOrder, getOrderStatusBadgeVariant, getOrderStatusLabel } from "../../enums/order";
import OrderDetailItemCard from "../../components/OrderDetailItemCard";
import ProductCatalogItemCard from "../../components/ProductCatalogItemCard";
import { extractCancelOrderApiError, useCancelRestaurantOrder } from "../../hooks/use-cancel-restaurant-order";
import { useOrderDetail } from "../../hooks/use-order-detail";
import { useResendOrderDetail } from "../../hooks/use-resend-order-detail";
import type {
	AvailableOrderProduct,
	OrderItem,
	OrderLocationState,
	ProductDraftQuantity,
} from "../../types/order-detail";
import { useRestaurantOrder } from "../../hooks/use-restaurant-order";
import { useRestaurantOrderPdf } from "../../hooks/use-restaurant-order-pdf";

const getOrderItemStatusId = (item: OrderItem) => {
	return item.restaurantOrderStatusId;
};

const isEditableOrderItem = (item: OrderItem) => {
	const statusId = getOrderItemStatusId(item);
	return statusId === OrderDetailStatus.Created || statusId === OrderDetailStatus.Preparing;
};

export default function OrderDetailPage() {
	const navigate = useNavigate();
	const { state } = useLocation() as { state: OrderLocationState | null };
	const params = useParams<{ restaurantOrderId: string }>();
	const restaurantOrderId = Number.parseInt(params.restaurantOrderId ?? "", 10);
	const hasValidOrder = Number.isInteger(restaurantOrderId) && restaurantOrderId > 0;

	const {
		products,
		isLoadingProducts,
		hasProductsError,
		createOrderDetail,
		updateOrderDetail,
		cancelOrderDetail,
		isUpdatingOrderDetail,
		isCancelingOrderDetail,
		orderDetails,
		sendOrderToTeam,
	} = useOrderDetail({
		restaurantOrderId: hasValidOrder ? restaurantOrderId : null,
		enabled: hasValidOrder,
	});

	const { resendOrderDetail, isResendingOrderDetail } = useResendOrderDetail({
		restaurantOrderId: hasValidOrder ? restaurantOrderId : null,
	});

	const orderPdfQuery = useRestaurantOrderPdf({
		restaurantOrderId: hasValidOrder ? restaurantOrderId : null,
	});
	const { cancelRestaurantOrder, isCancelingRestaurantOrder } = useCancelRestaurantOrder();

	const taxQuery = useRestaurantOrder(restaurantOrderId);

	const [orderItems, setOrderItems] = useState<Map<number, OrderItem>>(new Map());
	const [draftQuantities, setDraftQuantities] = useState<ProductDraftQuantity>({});
	const [stableProducts, setStableProducts] = useState<AvailableOrderProduct[]>([]);
	const [pendingAddProductIds, setPendingAddProductIds] = useState<Set<number>>(new Set());
	const [pendingSaveNoteDetailIds, setPendingSaveNoteDetailIds] = useState<Set<number>>(new Set());
	const [pendingCancelDetailIds, setPendingCancelDetailIds] = useState<Set<number>>(new Set());
	const [pendingResendDetailIds, setPendingResendDetailIds] = useState<Set<number>>(new Set());
	const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
	const previousOrderIdRef = useRef<number | null>(null);
	const orderStatusId = state?.restaurantOrder?.orderStatusId;
	const allowCancelOrder = canCancelOrder(orderStatusId);

	useEffect(() => {
		if (previousOrderIdRef.current === restaurantOrderId) {
			return;
		}

		previousOrderIdRef.current = restaurantOrderId;
		setOrderItems(new Map());
		setDraftQuantities({});
		setPendingAddProductIds(new Set());
		setPendingSaveNoteDetailIds(new Set());
		setPendingCancelDetailIds(new Set());
		setPendingResendDetailIds(new Set());
	}, [restaurantOrderId]);

	useEffect(() => {
		if (!orderDetails) {
			return;
		}
		const detailsMap: Map<number, OrderItem> = new Map();

		for (let i = 0; i < orderDetails.length; i++) {
			const sourceItem = orderDetails[i];
			if (sourceItem.restaurantOrderStatusId === OrderDetailStatus.Canceled) {
				continue;
			}

			if (!sourceItem.restaurantOrderDetailId) {
				continue;
			}

			detailsMap.set(sourceItem.restaurantOrderDetailId, {
				productId: sourceItem.productId,
				name: sourceItem.name,
				unitPrice: sourceItem.unitPrice,
				quantity: sourceItem.quantity,
				note: sourceItem.note,
				restaurantOrderDetailId: sourceItem.restaurantOrderDetailId,
				sentAt: sourceItem.sentAt,
				restaurantOrderStatusId: sourceItem.restaurantOrderStatusId,
				restaurantOrderStatus: sourceItem.restaurantOrderStatus,
				resendCount: sourceItem.resendCount ?? 0,
			});
		}

		setOrderItems(detailsMap);
	}, [orderDetails]);

	useEffect(() => {
		if (products.length > 0) {
			setStableProducts(products);
		}
	}, [products]);

	const sortedProducts = useMemo(() => {
		return [...stableProducts].sort((left, right) => left.name.localeCompare(right.name));
	}, [stableProducts]);

	const itemsList = useMemo(() => {
		return Array.from(orderItems.values()).sort((left, right) => {
			const nameSort = left.name.localeCompare(right.name);
			if (nameSort !== 0) {
				return nameSort;
			}

			return (left.restaurantOrderDetailId ?? 0) - (right.restaurantOrderDetailId ?? 0);
		});
	}, [orderItems]);

	const subtotal = useMemo(() => {
		return itemsList.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
	}, [itemsList]);

	const taxRate = taxQuery.data ?? 0;
	const taxAmount = subtotal * (taxRate / 100);
	const total = subtotal + taxAmount;

	const getDraftQuantity = (productId: number) => {
		return draftQuantities[productId] ?? 1;
	};

	const setDraftQuantity = (productId: number, nextValue: number) => {
		setDraftQuantities((previous) => ({
			...previous,
			[productId]: Number.isFinite(nextValue) && nextValue > 0 ? Math.floor(nextValue) : 1,
		}));
	};

	const setAddPending = (productId: number, isPending: boolean) => {
		setPendingAddProductIds((previous) => {
			const next = new Set(previous);
			if (isPending) {
				next.add(productId);
			} else {
				next.delete(productId);
			}
			return next;
		});
	};

	const setSaveNotePending = (restaurantOrderDetailId: number, isPending: boolean) => {
		setPendingSaveNoteDetailIds((previous) => {
			const next = new Set(previous);
			if (isPending) {
				next.add(restaurantOrderDetailId);
			} else {
				next.delete(restaurantOrderDetailId);
			}
			return next;
		});
	};

	const setCancelPending = (restaurantOrderDetailId: number, isPending: boolean) => {
		setPendingCancelDetailIds((previous) => {
			const next = new Set(previous);
			if (isPending) {
				next.add(restaurantOrderDetailId);
			} else {
				next.delete(restaurantOrderDetailId);
			}
			return next;
		});
	};

	const setResendPending = (restaurantOrderDetailId: number, isPending: boolean) => {
		setPendingResendDetailIds((previous) => {
			const next = new Set(previous);
			if (isPending) {
				next.add(restaurantOrderDetailId);
			} else {
				next.delete(restaurantOrderDetailId);
			}
			return next;
		});
	};

	const canResendOrderItem = (item: OrderItem) => {
		const statusId = getOrderItemStatusId(item);
		return item.sentAt !== null && statusId !== OrderDetailStatus.Delivered && statusId !== OrderDetailStatus.Canceled;
	};
	const validateAvailableProduct = (product: AvailableOrderProduct) => {
		if (!product.isAvailable || product.productStatus !== "Available") {
			toast.error(`${product.name} no esta disponible para agregar.`);
			return false;
		}

		return true;
	};

	const handleAddProduct = async (product: AvailableOrderProduct) => {
		if (pendingAddProductIds.has(product.productId)) {
			return;
		}

		setAddPending(product.productId, true);

		try {
			if (!validateAvailableProduct(product)) {
				return;
			}

			const requestedQuantity = getDraftQuantity(product.productId);
			if (requestedQuantity <= 0) {
				toast.error("La cantidad debe ser mayor a cero.");
				return;
			}

			if (requestedQuantity > product.availableStock) {
				toast.error(`Solo hay ${product.availableStock} unidades disponibles para ${product.name}.`);
				return;
			}

			const editableCandidate = Array.from(orderItems.values())
				.filter((item) => item.productId === product.productId && isEditableOrderItem(item))
				.sort((left, right) => {
					if (getOrderItemStatusId(left) !== getOrderItemStatusId(right)) {
						if (getOrderItemStatusId(left) === OrderDetailStatus.Preparing) {
							return -1;
						}
						if (getOrderItemStatusId(right) === OrderDetailStatus.Preparing) {
							return 1;
						}
					}

					return (right.restaurantOrderDetailId ?? 0) - (left.restaurantOrderDetailId ?? 0);
				})[0];

			const existingItem = editableCandidate;
			if (!existingItem) {
				const restaurantOrderDetailId = await createOrderDetail({
					restaurantOrderId,
					productId: product.productId,
					quantity: requestedQuantity,
					note: null,
				});

				setOrderItems((previous) => {
					const next = new Map(previous);
					next.set(restaurantOrderDetailId, {
						productId: product.productId,
						name: product.name,
						unitPrice: product.sellPrice,
						quantity: requestedQuantity,
						note: "",
						restaurantOrderDetailId,
						sentAt: null,
						restaurantOrderStatusId: OrderDetailStatus.Created,
						restaurantOrderStatus: "Pendiente",
						resendCount: 0,
					});
					return next;
				});
				toast.success(`${product.name} agregado correctamente.`);
				return;
			}

			const nextQuantity = existingItem.quantity + requestedQuantity;
			if (nextQuantity > product.availableStock) {
				toast.error(`No puedes superar ${product.availableStock} unidades para ${product.name}.`);
				return;
			}

			if (!existingItem.restaurantOrderDetailId) {
				toast.error("No se pudo identificar el detalle del pedido para actualizar la cantidad.");
				return;
			}

			await updateOrderDetail({
				restaurantOrderDetailId: existingItem.restaurantOrderDetailId,
				quantity: nextQuantity,
				note: !existingItem.note?.trim() ? null : existingItem.note.trim(),
			});

			const existingDetailId = existingItem.restaurantOrderDetailId;
			if (!existingDetailId) {
				return;
			}

			setOrderItems((previous) => {
				const next = new Map(previous);
				next.set(existingDetailId, {
					...existingItem,
					quantity: nextQuantity,
				});
				return next;
			});
			toast.success(`Cantidad actualizada para ${product.name}.`);
		} finally {
			setAddPending(product.productId, false);
		}
	};

	const handlePrintOrder = async () => {
		try {
			const { data: blob } = await orderPdfQuery.refetch();

			if (!blob) return;

			const url = URL.createObjectURL(blob);

			window.open(url, "_blank");
			URL.revokeObjectURL(url);
		} catch {
			toast.error("Error en la reimpresion de la orden");
		}
	};

	const updateItemQuantity = async (item: OrderItem, product: AvailableOrderProduct, delta: 1 | -1) => {
		if (!item.restaurantOrderDetailId) {
			return;
		}

		const currentItem = orderItems.get(item.restaurantOrderDetailId);
		if (!currentItem || !currentItem.restaurantOrderDetailId) {
			return;
		}

		const currentDetailId = currentItem.restaurantOrderDetailId;

		if (!isEditableOrderItem(currentItem)) {
			toast.error("Este item no se puede editar porque ya fue enviado o finalizado.");
			return;
		}

		const nextQuantity = currentItem.quantity + delta;
		if (nextQuantity <= 0) {
			toast.error("La cantidad minima es 1. Si deseas quitarlo, por ahora reduce la cantidad manualmente.");
			return;
		}

		if (nextQuantity > product.availableStock) {
			toast.error(`No puedes superar ${product.availableStock} unidades para ${product.name}.`);
			return;
		}

		await updateOrderDetail({
			restaurantOrderDetailId: currentItem.restaurantOrderDetailId,
			quantity: nextQuantity,
			note: !currentItem.note?.trim() ? null : currentItem.note.trim(),
		});

		setOrderItems((previous) => {
			const next = new Map(previous);
			next.set(currentDetailId, {
				...currentItem,
				quantity: nextQuantity,
			});
			return next;
		});
	};

	const handleCancelItem = async (restaurantOrderDetailId: number) => {
		const target = orderItems.get(restaurantOrderDetailId);
		if (!target || !target.restaurantOrderDetailId) {
			return;
		}

		if (pendingCancelDetailIds.has(target.restaurantOrderDetailId)) {
			return;
		}

		if (!canCancelFromPos(getOrderItemStatusId(target))) {
			toast.error("Solo se pueden cancelar items en estado Pendiente.");
			return;
		}

		setCancelPending(target.restaurantOrderDetailId, true);

		try {
			await cancelOrderDetail({
				restaurantOrderDetailId: target.restaurantOrderDetailId,
				newStatusId: OrderDetailStatus.Canceled,
			});

			setOrderItems((previous) => {
				const next = new Map(previous);
				next.delete(restaurantOrderDetailId);
				return next;
			});

			toast.success(`${target.name} cancelado correctamente.`);
		} catch {
			toast.error("No se pudo cancelar el item. Intenta nuevamente.");
		} finally {
			setCancelPending(target.restaurantOrderDetailId, false);
		}
	};

	const handleNoteChange = (restaurantOrderDetailId: number, note: string) => {
		setOrderItems((previous) => {
			const target = previous.get(restaurantOrderDetailId);
			if (!target) {
				return previous;
			}

			const next = new Map(previous);
			next.set(restaurantOrderDetailId, { ...target, note });
			return next;
		});
	};

	const handleResendItem = async (restaurantOrderDetailId: number) => {
		const target = orderItems.get(restaurantOrderDetailId);
		if (!target || !target.restaurantOrderDetailId) {
			return;
		}

		if (pendingResendDetailIds.has(restaurantOrderDetailId)) {
			return;
		}

		if (!canResendOrderItem(target)) {
			toast.error("Solo se pueden reenviar items enviados que no esten en estado Listo o Cancelado.");
			return;
		}

		setResendPending(restaurantOrderDetailId, true);

		try {
			await resendOrderDetail(restaurantOrderDetailId);
			setOrderItems((previous) => {
				const next = new Map(previous);
				next.set(restaurantOrderDetailId, {
					...target,
					resendCount: (target.resendCount ?? 0) + 1,
				});
				return next;
			});
			toast.success(`Comanda reenviada para ${target.name}.`);
		} catch {
			toast.error("No se pudo reenviar la comanda. Intenta nuevamente.");
		} finally {
			setResendPending(restaurantOrderDetailId, false);
		}
	};

	const handleSaveNote = async (restaurantOrderDetailId: number) => {
		if (pendingSaveNoteDetailIds.has(restaurantOrderDetailId)) {
			return;
		}

		const target = orderItems.get(restaurantOrderDetailId);
		if (!target || !target.restaurantOrderDetailId) {
			return;
		}

		if (!isEditableOrderItem(target)) {
			toast.error("Este item no se puede editar porque ya fue enviado o finalizado.");
			return;
		}

		setSaveNotePending(restaurantOrderDetailId, true);

		try {
			await updateOrderDetail({
				restaurantOrderDetailId: target.restaurantOrderDetailId,
				quantity: target.quantity,
				note: !target.note?.trim() ? null : target.note.trim(),
			});
			toast.success(`Nota guardada para ${target.name}.`);
		} finally {
			setSaveNotePending(restaurantOrderDetailId, false);
		}
	};

	const handleConfirmOrderCancellation = async () => {
		if (!hasValidOrder) {
			return;
		}

		try {
			await cancelRestaurantOrder({ restaurantOrderId });
			toast.success("Cuenta cancelada correctamente.");
			setIsCancelDialogOpen(false);
			navigate("/sales/orders");
		} catch (error) {
			const backendError = extractCancelOrderApiError(error);
			if (backendError) {
				toast.error(backendError);
				return;
			}

			toast.error("No se pudo cancelar la cuenta. Intenta nuevamente.");
		}
	};

	if (!hasValidOrder) {
		return (
			<Alert>
				<CircleAlert className="size-4" />
				<AlertTitle>Pedido invalido</AlertTitle>
				<AlertDescription>No se encontro un identificador valido para el pedido seleccionado.</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="flex h-full w-full flex-col gap-5 pb-6">
			<div className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
				<div>
					<div className="flex items-center gap-2">
						<Badge variant="info">Punto de venta</Badge>
						<Badge variant="outline">Detalle de orden</Badge>
						{typeof orderStatusId === "number" ? (
							<Badge variant={getOrderStatusBadgeVariant(orderStatusId)}>{getOrderStatusLabel(orderStatusId)}</Badge>
						) : null}
					</div>
					<Title as="h1" className="mt-2">
						Pedido #{state?.restaurantOrder?.dailyNumber ?? restaurantOrderId}
					</Title>
					<p className="mt-1 text-sm text-muted-foreground">
						Gestiona productos, cantidades y notas de cocina en tiempo real.
					</p>
				</div>

				<div className="flex flex-col gap-2 lg:items-end">
					<Button variant="outline" onClick={() => navigate("/sales/orders")} className="w-full">
						<ArrowLeft className="size-4" />
						Volver a tickets
					</Button>

					<Button variant="outline" onClick={handlePrintOrder} className="w-full">
						<Printer className="size-4" />
						Reimprimir
					</Button>

					{allowCancelOrder ? (
						<Button variant="destructive" onClick={() => setIsCancelDialogOpen(true)} className="w-full">
							Cancelar cuenta
						</Button>
					) : null}
				</div>
			</div>

			{hasProductsError ? (
				<Alert>
					<CircleAlert className="size-4" />
					<AlertTitle>Error al cargar productos</AlertTitle>
					<AlertDescription>
						Intenta recargar la pagina para volver a consultar el catalogo del pedido.
					</AlertDescription>
				</Alert>
			) : null}

			<div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
				<div className="space-y-5">
					<Card>
						<CardHeader>
							<CardTitle>Items seleccionados</CardTitle>
							<CardDescription>
								Modifica cantidades y notas, reenvia comandas ya enviadas y usa reimpresion como accion placeholder.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{itemsList.length === 0 ? (
								<div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
									<p className="text-sm font-medium text-text-primary">No hay productos en esta orden.</p>
									<p className="mt-2 text-sm text-muted-foreground">
										Agrega productos desde el catalogo para construir el pedido.
									</p>
								</div>
							) : (
								<div className="space-y-3">
									{itemsList.map((item) => {
										const product = products.find((candidate) => candidate.productId === item.productId);
										const itemSubtotal = item.quantity * item.unitPrice;
										const detailId = item.restaurantOrderDetailId;

										return (
											<OrderDetailItemCard
												key={item.restaurantOrderDetailId}
												item={item}
												product={product}
												statusLabel={getOrderDetailStatusLabel(
													item.restaurantOrderStatusId,
													item.restaurantOrderStatus,
												)}
												itemSubtotal={itemSubtotal}
												isEditable={isEditableOrderItem(item)}
												canCancel={canCancelFromPos(getOrderItemStatusId(item))}
												canResend={canResendOrderItem(item)}
												isUpdatingOrderDetail={isUpdatingOrderDetail}
												isCancelingOrderDetail={isCancelingOrderDetail}
												isResendingOrderDetail={isResendingOrderDetail}
												isCancelPending={detailId ? pendingCancelDetailIds.has(detailId) : false}
												isResendPending={detailId ? pendingResendDetailIds.has(detailId) : false}
												isSaveNotePending={detailId ? pendingSaveNoteDetailIds.has(detailId) : false}
												onDecreaseQuantity={() => {
													if (product) {
														void updateItemQuantity(item, product, -1);
													}
												}}
												onIncreaseQuantity={() => {
													if (product) {
														void updateItemQuantity(item, product, 1);
													}
												}}
												onCancelItem={() => {
													if (!detailId) {
														return;
													}

													void handleCancelItem(detailId);
												}}
												onResendItem={() => {
													if (!detailId) {
														return;
													}

													void handleResendItem(detailId);
												}}
												onNoteChange={(note) => {
													if (!detailId) {
														return;
													}

													handleNoteChange(detailId, note);
												}}
												onSaveNote={() => {
													if (!detailId) {
														return;
													}

													void handleSaveNote(detailId);
												}}
											/>
										);
									})}
								</div>
							)}

							<Button
								className="w-full"
								onClick={async () => {
									await sendOrderToTeam();
									toast.success("Orden correctamente enviado a los equipos correspondientes");
								}}
								disabled={itemsList?.every((item) => item.sentAt !== null && item.sentAt !== undefined)}
							>
								Enviar orden
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Totales del pedido</CardTitle>
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
							{taxQuery.isError ? (
								<p className="text-xs text-warning">
									No se pudo obtener el impuesto global. Se usara 0% temporalmente.
								</p>
							) : null}
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ShoppingBasket className="size-5 text-primary" />
							Catalogo de productos
						</CardTitle>
						<CardDescription>Selecciona productos disponibles para agregarlos al pedido.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{isLoadingProducts && sortedProducts.length === 0 ? (
							<p className="text-sm text-muted-foreground">Cargando catalogo...</p>
						) : null}
						{sortedProducts.map((product) => {
							return (
								<ProductCatalogItemCard
									key={product.productId}
									product={product}
									draftQuantity={getDraftQuantity(product.productId)}
									isAddPending={pendingAddProductIds.has(product.productId)}
									onDraftQuantityChange={(value) => {
										setDraftQuantity(product.productId, value);
									}}
									onAddProduct={() => {
										void handleAddProduct(product);
									}}
								/>
							);
						})}
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
						<Button
							variant="outline"
							onClick={() => setIsCancelDialogOpen(false)}
							disabled={isCancelingRestaurantOrder}
						>
							Cerrar
						</Button>
						<Button
							variant="destructive"
							onClick={() => void handleConfirmOrderCancellation()}
							disabled={isCancelingRestaurantOrder}
						>
							{isCancelingRestaurantOrder ? "Cancelando..." : "Confirmar cancelacion"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
