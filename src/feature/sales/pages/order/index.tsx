import { CircleAlert, Plus, ReceiptText, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useSelectedCompanyId } from "@/store/companyStore";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Title } from "@/ui/typography";
import PosTicketCard from "../../components/PosTicketCard";
import { canCancelOrder, isOrderOpen } from "../../enums/order";
import { extractCancelOrderApiError, useCancelRestaurantOrder } from "../../hooks/use-cancel-restaurant-order";
import { useRestaurantOrders } from "../../hooks/use-pos-tickets";
import { useWaiters } from "../../hooks/use-waiters";
import type { RestaurantOrder } from "../../types/order";

export default function OrderPage() {
	const navigate = useNavigate();
	const selectedCompanyId = useSelectedCompanyId();
	const companyId = Number.parseInt(selectedCompanyId ?? "", 10);
	const hasValidCompany = Number.isInteger(companyId) && companyId > 0;

	const { orders, createRestaurantOrder, isCreatingRestaurantOrder, assignWaiter } = useRestaurantOrders(
		hasValidCompany ? companyId : null,
	);
	const { cancelRestaurantOrder, isCancelingRestaurantOrder } = useCancelRestaurantOrder();
	const waitersQuery = useWaiters(hasValidCompany ? companyId : null);
	const [targetOrderToCancel, setTargetOrderToCancel] = useState<RestaurantOrder | null>(null);

	const openOrdersCount = useMemo(() => {
		return orders.filter((order) => isOrderOpen(order.orderStatusId)).length;
	}, [orders]);

	const handleCreateOrder = async () => {
		if (!hasValidCompany) {
			toast.error("Selecciona una compania antes de crear una cuenta.");
			return;
		}

		await createRestaurantOrder(companyId);
		toast.success("Cuenta creada correctamente.");
	};

	const handleAssignWaiter = async (restaurantOrderId: number, waiterId: number | null) => {
		if (!hasValidCompany) {
			return;
		}

		await assignWaiter(companyId, waiterId, restaurantOrderId);
		const assignedWaiter = waitersQuery.data?.find((waiter) => waiter.id === waiterId);
		toast.success(
			assignedWaiter ? `Mesero ${assignedWaiter.name} asignado correctamente.` : "Asignacion de mesero actualizada.",
		);
	};

	const handleContinueToCheckout = (restaurantOrder: RestaurantOrder) => {
		if (!isOrderOpen(restaurantOrder.orderStatusId)) {
			toast.error("Solo se puede cobrar una cuenta abierta.");
			return;
		}

		if (!restaurantOrder.waiterId) {
			toast.error("Debes asignar un mesero antes de continuar a cobro.");
			return;
		}

		navigate(`/sales/orders/${restaurantOrder.restaurantOrderId}/checkout`, {
			state: { restaurantOrder },
		});
	};

	const handleTakeOrder = (restaurantOrder: RestaurantOrder) => {
		if (!isOrderOpen(restaurantOrder.orderStatusId)) {
			toast.error("Solo se puede gestionar una cuenta abierta.");
			return;
		}

		navigate(`/sales/orders/${restaurantOrder.restaurantOrderId}`, {
			state: { restaurantOrder },
		});
	};

	const handleConfirmCancelOrder = async () => {
		if (!targetOrderToCancel) {
			return;
		}

		try {
			await cancelRestaurantOrder({ restaurantOrderId: targetOrderToCancel.restaurantOrderId });
			toast.success("Cuenta cancelada correctamente.");
			setTargetOrderToCancel(null);
		} catch (error) {
			const backendError = extractCancelOrderApiError(error);
			if (backendError) {
				toast.error(backendError);
				setTargetOrderToCancel(null);
				return;
			}

			toast.error("No se pudo cancelar la cuenta. Intenta nuevamente.");
		}
	};

	return (
		<div className="flex h-full w-full flex-col gap-5 pb-6">
			<div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Badge variant="info">Punto de venta</Badge>
						<Badge variant="outline">Ordenes abiertas</Badge>
					</div>
					<Title as="h1">Cuentas del punto de venta</Title>
					<p className="max-w-2xl text-sm text-muted-foreground">
						Crea cuentas abiertas, mantenlas disponibles en la sesion y asigna meseros antes de enviar el ticket a
						cobro.
					</p>
				</div>

				<Button
					onClick={() => void handleCreateOrder()}
					disabled={!hasValidCompany || isCreatingRestaurantOrder}
					className="min-w-40"
				>
					<Plus className="size-4" />
					{isCreatingRestaurantOrder ? "Creando..." : "Nueva Cuenta"}
				</Button>
			</div>

			{!hasValidCompany ? (
				<Alert>
					<CircleAlert className="size-4" />
					<AlertTitle>Compania requerida</AlertTitle>
					<AlertDescription>
						Selecciona una compania para crear tickets y consultar el listado de meseros.
					</AlertDescription>
				</Alert>
			) : null}

			<div className="grid gap-4 md:grid-cols-3">
				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>Cuentas abiertas</CardDescription>
						<CardTitle className="flex items-center gap-2 text-3xl">
							<ReceiptText className="size-6 text-primary" />
							<span>{openOrdersCount}</span>
						</CardTitle>
					</CardHeader>
				</Card>

				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>Tickets con mesero</CardDescription>
						<CardTitle className="text-3xl">{orders.filter((order) => order.waiterId).length}</CardTitle>
					</CardHeader>
				</Card>

				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>Meseros disponibles</CardDescription>
						<CardTitle className="flex items-center gap-2 text-3xl">
							<UsersRound className="size-6 text-primary" />
							<span>{waitersQuery.data?.length ?? 0}</span>
						</CardTitle>
					</CardHeader>
				</Card>
			</div>

			<Card className="gap-4">
				<CardHeader className="gap-2">
					<CardTitle>Lista de cuentas abiertas</CardTitle>
					<CardDescription>
						Esta es tu lista de tickets abiertos, por lo que asegurate de tener un mesero disponible para ir continuar
						con el cobro.
					</CardDescription>
				</CardHeader>

				<CardContent>
					{hasValidCompany && orders.length === 0 ? (
						<div className="rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
							<p className="text-sm font-medium text-text-primary">Aun no hay cuentas abiertas para esta compania.</p>
							<p className="mt-2 text-sm text-muted-foreground">
								Usa Nueva Cuenta para abrir el primer ticket del POS.
							</p>
						</div>
					) : (
						<div className="grid gap-4 xl:grid-cols-2">
							{orders.map((restaurantOrder) => (
								<PosTicketCard
									key={restaurantOrder.id}
									restaurantOrder={restaurantOrder}
									waiters={waitersQuery.data ?? []}
									isLoadingWaiters={waitersQuery.isLoading}
									onAssignWaiter={handleAssignWaiter}
									onTakeOrder={handleTakeOrder}
									onContinueToCheckout={handleContinueToCheckout}
									onCancelOrder={(order) => {
										if (!canCancelOrder(order.orderStatusId)) {
											toast.error("Solo se puede cancelar una cuenta abierta.");
											return;
										}

										setTargetOrderToCancel(order);
									}}
									isCancelingOrder={
										isCancelingRestaurantOrder &&
										targetOrderToCancel?.restaurantOrderId === restaurantOrder.restaurantOrderId
									}
								/>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<Dialog
				open={targetOrderToCancel !== null}
				onOpenChange={(isOpen) => {
					if (!isOpen) {
						setTargetOrderToCancel(null);
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Cancelar cuenta</DialogTitle>
						<DialogDescription>Esta accion cancelara la cuenta y todos sus items. Deseas continuar?</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setTargetOrderToCancel(null)}
							disabled={isCancelingRestaurantOrder}
						>
							Cerrar
						</Button>
						<Button
							variant="destructive"
							onClick={() => void handleConfirmCancelOrder()}
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
