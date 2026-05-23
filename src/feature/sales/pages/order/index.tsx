import { CircleAlert, Plus, ReceiptText, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useSelectedCompanyCen } from "@/store/companyStore";
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
import type { Ticket } from "../../types/order";

export default function OrderPage() {
	const navigate = useNavigate();
	const selectedCompanyCen = useSelectedCompanyCen();
	const companyCen = selectedCompanyCen ?? "";
	const hasValidCompany = companyCen.trim() !== "";

	const { tickets, createTicket, isCreatingRestaurantOrder, assignTicketWaiter } = useRestaurantOrders(
		hasValidCompany ? companyCen : null,
	);
	const { cancelTicket, isCancelingTicket } = useCancelRestaurantOrder();
	const waitersQuery = useWaiters(hasValidCompany ? companyCen : null);
	const [targetTicketToCancel, setTargetTicketToCancel] = useState<Ticket | null>(null);

	const openTicketsCount = useMemo(() => {
		return tickets.filter((ticket) => isOrderOpen(ticket.status)).length;
	}, [tickets]);

	const handleCreateTicket = async () => {
		if (!hasValidCompany) {
			toast.error("Selecciona una compania antes de crear una cuenta.");
			return;
		}

		await createTicket(companyCen);
		toast.success("Cuenta creada correctamente.");
	};

	const handleAssignWaiter = async (ticketCen: string, waiterCen: string | null) => {
		if (!hasValidCompany) {
			return;
		}

		await assignTicketWaiter(companyCen, waiterCen, ticketCen);
		const assignedWaiter = waitersQuery.data?.find((waiter) => waiter.waiterCen === waiterCen);
		toast.success(
			assignedWaiter ? `Mesero ${assignedWaiter.name} asignado correctamente.` : "Asignacion de mesero actualizada.",
		);
	};

	const handleContinueToCheckout = (ticket: Ticket) => {
		if (!isOrderOpen(ticket.status)) {
			toast.error("Solo se puede cobrar una cuenta abierta.");
			return;
		}

		if (!ticket.waiterCen) {
			toast.error("Debes asignar un mesero antes de continuar a cobro.");
			return;
		}

		navigate(`/sales/tickets/${encodeURIComponent(ticket.ticketCen)}/checkout`, {
			state: { ticket },
		});
	};

	const handleTakeOrder = (ticket: Ticket) => {
		if (!isOrderOpen(ticket.status)) {
			toast.error("Solo se puede gestionar una cuenta abierta.");
			return;
		}

		navigate(`/sales/tickets/${encodeURIComponent(ticket.ticketCen)}`, {
			state: { ticket },
		});
	};

	const handleConfirmCancelTicket = async () => {
		if (!targetTicketToCancel || !hasValidCompany) {
			return;
		}

		try {
			await cancelTicket({ companyCen, ticketCen: targetTicketToCancel.ticketCen });
			toast.success("Cuenta cancelada correctamente.");
			setTargetTicketToCancel(null);
		} catch (error) {
			const backendError = extractCancelOrderApiError(error);
			toast.error(backendError ?? "No se pudo cancelar la cuenta. Intenta nuevamente.");
			setTargetTicketToCancel(null);
		}
	};

	return (
		<div className="flex h-full w-full flex-col gap-5 pb-6">
			<div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Badge variant="info">Punto de venta</Badge>
						<Badge variant="outline">Tickets abiertos</Badge>
					</div>
					<Title as="h1">Cuentas del punto de venta</Title>
					<p className="max-w-2xl text-sm text-muted-foreground">
						Crea tickets abiertos, asigna meseros y gestiona cada cuenta usando el contrato publico CEN.
					</p>
				</div>

				<Button onClick={() => void handleCreateTicket()} disabled={!hasValidCompany || isCreatingRestaurantOrder}>
					<Plus className="size-4" />
					{isCreatingRestaurantOrder ? "Creando..." : "Nueva cuenta"}
				</Button>
			</div>

			{!hasValidCompany ? (
				<Alert>
					<CircleAlert className="size-4" />
					<AlertTitle>Compania requerida</AlertTitle>
					<AlertDescription>Selecciona una compania para crear tickets y consultar meseros.</AlertDescription>
				</Alert>
			) : null}

			<div className="grid gap-4 md:grid-cols-3">
				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>Cuentas abiertas</CardDescription>
						<CardTitle className="flex items-center gap-2 text-3xl">
							<ReceiptText className="size-6 text-primary" />
							<span>{openTicketsCount}</span>
						</CardTitle>
					</CardHeader>
				</Card>
				<Card className="gap-3">
					<CardHeader className="gap-1">
						<CardDescription>Tickets con mesero</CardDescription>
						<CardTitle className="text-3xl">{tickets.filter((ticket) => ticket.waiterCen).length}</CardTitle>
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
					<CardDescription>Selecciona una cuenta para tomar pedido o continuar a cobro.</CardDescription>
				</CardHeader>
				<CardContent>
					{hasValidCompany && tickets.length === 0 ? (
						<div className="rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
							<p className="text-sm font-medium text-text-primary">Aun no hay cuentas abiertas para esta compania.</p>
							<p className="mt-2 text-sm text-muted-foreground">Usa Nueva cuenta para abrir el primer ticket.</p>
						</div>
					) : (
						<div className="grid gap-4 xl:grid-cols-2">
							{tickets.map((ticket) => (
								<PosTicketCard
									key={ticket.ticketCen}
									ticket={ticket}
									waiters={waitersQuery.data ?? []}
									isLoadingWaiters={waitersQuery.isLoading}
									onAssignWaiter={handleAssignWaiter}
									onTakeOrder={handleTakeOrder}
									onContinueToCheckout={handleContinueToCheckout}
									onCancelOrder={(targetTicket) => {
										if (!canCancelOrder(targetTicket.status)) {
											toast.error("Solo se puede cancelar una cuenta abierta.");
											return;
										}
										setTargetTicketToCancel(targetTicket);
									}}
									isCancelingOrder={isCancelingTicket && targetTicketToCancel?.ticketCen === ticket.ticketCen}
								/>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<Dialog
				open={targetTicketToCancel !== null}
				onOpenChange={(isOpen) => {
					if (!isOpen) setTargetTicketToCancel(null);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Cancelar cuenta</DialogTitle>
						<DialogDescription>Esta accion cancelara la cuenta y todos sus items. Deseas continuar?</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setTargetTicketToCancel(null)} disabled={isCancelingTicket}>
							Cerrar
						</Button>
						<Button variant="destructive" onClick={() => void handleConfirmCancelTicket()} disabled={isCancelingTicket}>
							{isCancelingTicket ? "Cancelando..." : "Confirmar cancelacion"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
