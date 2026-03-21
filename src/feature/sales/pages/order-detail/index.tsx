import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Title } from "@/ui/typography";
import { fCurrency } from "@/utils/format-number";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, CircleAlert, Minus, Plus, ShoppingBasket } from "lucide-react";
import { useSelectedCompanyId } from "@/store/companyStore";
import { useOrderDetail } from "../../hooks/use-order-detail";
import { useTax } from "../../hooks/use-tax";
import type { AvailableOrderProduct, OrderItem, OrderLocationState, ProductDraftQuantity } from "../../types/order-detail";

export default function OrderDetailPage() {
	const navigate = useNavigate();
	const { state } = useLocation() as { state: OrderLocationState | null };
	const params = useParams<{ restaurantOrderId: string }>();
	const selectedCompanyId = useSelectedCompanyId();
	const companyId = Number.parseInt(selectedCompanyId ?? "", 10);
	const restaurantOrderId = Number.parseInt(params.restaurantOrderId ?? "", 10);
	const hasValidOrder = Number.isInteger(restaurantOrderId) && restaurantOrderId > 0;
	const hasValidCompany = Number.isInteger(companyId) && companyId > 0;

	const { products, isLoadingProducts, hasProductsError, createOrderDetail, updateOrderDetail, isUpdatingOrderDetail, orderDetails } =
		useOrderDetail({
			restaurantOrderId: hasValidOrder ? restaurantOrderId : null,
			enabled: hasValidOrder,
		});
	const taxQuery = useTax(hasValidCompany ? companyId : null);

	const [orderItems, setOrderItems] = useState<Map<number, OrderItem>>(new Map());
	const [hasHydrated, setHasHydrated] = useState(false);
	const [draftQuantities, setDraftQuantities] = useState<ProductDraftQuantity>({});
	const [stableProducts, setStableProducts] = useState<AvailableOrderProduct[]>([]);
	const [pendingAddProductIds, setPendingAddProductIds] = useState<Set<number>>(new Set());
	const [pendingSaveNoteProductIds, setPendingSaveNoteProductIds] = useState<Set<number>>(new Set());
	const previousOrderIdRef = useRef<number | null>(null);

	useEffect(() => {
		if (previousOrderIdRef.current === restaurantOrderId) {
			return;
		}

		previousOrderIdRef.current = restaurantOrderId;
		setOrderItems(new Map());
        setDraftQuantities({});
		setPendingAddProductIds(new Set());
		setPendingSaveNoteProductIds(new Set());
		setHasHydrated(false);
	}, [restaurantOrderId]);

    useEffect(() => {
        if(!orderDetails) {
            return;
        }
        const productsMap: Map<number, OrderItem> = new Map();

        for(let i = 0; i < orderDetails.length; i++) {
            productsMap.set(orderDetails[i].productId, {
                productId: orderDetails[i].productId,
                name: orderDetails[i].name,
                unitPrice: orderDetails[i].unitPrice,
                quantity: orderDetails[i].quantity,
                note: orderDetails[i].note,
                restaurantOrderDetailId: orderDetails[i].restaurantOrderDetailId,
                sentAt: orderDetails[i].sentAt
            });
        }

        setOrderItems(productsMap);
    }, [orderDetails])

	useEffect(() => {
		if (hasHydrated || products.length === 0) {
			return;
		}

		setHasHydrated(true);
	}, [hasHydrated, products.length]);

	useEffect(() => {
		if (products.length > 0) {
			setStableProducts(products);
		}
	}, [products]);

	const sortedProducts = useMemo(() => {
		return [...stableProducts].sort((left, right) => left.name.localeCompare(right.name));
	}, [stableProducts]);

	const itemsList = useMemo(() => {
		return Array.from(orderItems.values()).sort((left, right) => left.name.localeCompare(right.name));
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

	const setSaveNotePending = (productId: number, isPending: boolean) => {
		setPendingSaveNoteProductIds((previous) => {
			const next = new Set(previous);
			if (isPending) {
				next.add(productId);
			} else {
				next.delete(productId);
			}
			return next;
		});
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

			const existingItem = orderItems.get(product.productId);
			if (!existingItem) {
				const restaurantOrderDetailId = await createOrderDetail({
					restaurantOrderId,
					productId: product.productId,
					quantity: requestedQuantity,
					note: null,
				});

				setOrderItems((previous) => {
					const next = new Map(previous);
					next.set(product.productId, {
						productId: product.productId,
						name: product.name,
						unitPrice: product.sellPrice,
						quantity: requestedQuantity,
						note: "",
						restaurantOrderDetailId,
                        sentAt: null
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
				note: existingItem.note,
			});

			setOrderItems((previous) => {
				const next = new Map(previous);
				next.set(product.productId, {
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

	const updateItemQuantity = async (product: AvailableOrderProduct, delta: 1 | -1) => {
		const currentItem = orderItems.get(product.productId);
		if (!currentItem || !currentItem.restaurantOrderDetailId) {
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
			note: currentItem.note,
		});

		setOrderItems((previous) => {
			const next = new Map(previous);
			next.set(product.productId, {
				...currentItem,
				quantity: nextQuantity,
			});
			return next;
		});
	};

	const handleNoteChange = (productId: number, note: string) => {
		setOrderItems((previous) => {
			const target = previous.get(productId);
			if (!target) {
				return previous;
			}

			const next = new Map(previous);
			next.set(productId, { ...target, note });
			return next;
		});
	};

	const handleSaveNote = async (productId: number) => {
		if (pendingSaveNoteProductIds.has(productId)) {
			return;
		}

		const target = orderItems.get(productId);
		if (!target || !target.restaurantOrderDetailId) {
			return;
		}

		setSaveNotePending(productId, true);

		try {
			await updateOrderDetail({
				restaurantOrderDetailId: target.restaurantOrderDetailId,
				quantity: target.quantity,
				note: target.note,
			});
			toast.success(`Nota guardada para ${target.name}.`);
		} finally {
			setSaveNotePending(productId, false);
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
					</div>
					<Title as="h1" className="mt-2">
						Pedido #{state?.restaurantOrder?.dailyNumber ?? restaurantOrderId}
					</Title>
					<p className="mt-1 text-sm text-muted-foreground">
						Gestiona productos, cantidades y notas de cocina en tiempo real.
					</p>
				</div>
				<Button variant="outline" onClick={() => navigate("/sales/orders")}>
					<ArrowLeft className="size-4" />
					Volver a tickets
				</Button>
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
							<CardDescription>Modifica cantidades y agrega notas para cocina.</CardDescription>
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

										return (
											<div key={item.productId} className="space-y-3 rounded-xl border bg-muted/10 p-4">
												<div className="flex flex-wrap items-center justify-between gap-2">
													<div>
														<p className="font-medium text-text-primary">{item.name}</p>
														<p className="text-sm text-muted-foreground">
															Precio unitario: {fCurrency(item.unitPrice)}
														</p>
													</div>
													<p className="text-sm font-semibold text-text-primary">Subtotal: {fCurrency(itemSubtotal)}</p>
												</div>

												<div className="flex flex-wrap items-center gap-2">
													<Button
														variant="outline"
														size="icon"
														disabled={!product || isUpdatingOrderDetail}
														onClick={() => {
															if (product) {
																void updateItemQuantity(product, -1);
															}
														}}
													>
														<Minus className="size-4" />
													</Button>
													<div className="min-w-16 rounded-md border bg-background px-3 py-1 text-center text-sm font-semibold">
														{item.quantity}
													</div>
													<Button
														variant="outline"
														size="icon"
														disabled={!product || isUpdatingOrderDetail}
														onClick={() => {
															if (product) {
																void updateItemQuantity(product, 1);
															}
														}}
													>
														<Plus className="size-4" />
													</Button>
												</div>

												<div className="space-y-2">
													<Textarea
														value={item.note}
														onChange={(event) => handleNoteChange(item.productId, event.target.value)}
														placeholder="Notas para cocina (opcional)"
														rows={2}
													/>
													<div className="flex justify-end">
														<Button
															variant="secondary"
															size="sm"
															disabled={pendingSaveNoteProductIds.has(item.productId)}
															onClick={() => {
																void handleSaveNote(item.productId);
															}}
														>
															{pendingSaveNoteProductIds.has(item.productId) ? "Guardando..." : "Guardar nota"}
														</Button>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
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
							const isUnavailable =
								!product.isAvailable || product.availableStock <= 0 || product.productStatus !== "Available";

							return (
								<div key={product.productId} className="space-y-3 rounded-xl border bg-muted/10 p-4">
									<div className="flex items-start justify-between gap-2">
										<div>
											<p className="font-medium text-text-primary">{product.name}</p>
											<p className="text-sm text-muted-foreground">Precio: {fCurrency(product.sellPrice)}</p>
										</div>
										<div className="flex flex-col items-end gap-2">
											<Badge variant={isUnavailable ? "destructive" : "success"}>
												{isUnavailable ? "No disponible" : "Disponible"}
											</Badge>
											<span className="text-xs text-muted-foreground">Stock: {product.availableStock}</span>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Input
											type="number"
											min={1}
											value={getDraftQuantity(product.productId)}
											onChange={(event) => {
												setDraftQuantity(product.productId, Number(event.target.value));
											}}
											className="w-24"
										/>
										<Button
											className="flex-1"
											disabled={pendingAddProductIds.has(product.productId)}
											onClick={() => {
												void handleAddProduct(product);
											}}
										>
											{pendingAddProductIds.has(product.productId) ? "Agregando..." : "Agregar al pedido"}
										</Button>
									</div>
								</div>
							);
						})}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
