import { format } from "date-fns";
import { Clock3, Ticket, UserRound } from "lucide-react";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Text } from "@/ui/typography";
import { canCancelOrder, getOrderStatusBadgeVariant, getOrderStatusLabel, isOrderOpen } from "../enums/order";
import type { Ticket as PosTicket, Waiter } from "../types/order";

type PosTicketCardProps = {
	ticket: PosTicket;
	waiters: Waiter[];
	isLoadingWaiters: boolean;
	onAssignWaiter: (ticketCen: string, waiterCen: string | null) => void;
	onTakeOrder: (ticket: PosTicket) => void;
	onContinueToCheckout: (ticket: PosTicket) => void;
	onCancelOrder: (ticket: PosTicket) => void;
	isCancelingOrder: boolean;
};

export default function PosTicketCard({
	ticket,
	waiters,
	isLoadingWaiters,
	onAssignWaiter,
	onTakeOrder,
	onContinueToCheckout,
	onCancelOrder,
	isCancelingOrder,
}: PosTicketCardProps) {
	const assignedWaiter = waiters.find((waiter) => waiter.waiterCen === ticket.waiterCen);
	const orderIsOpen = isOrderOpen(ticket.status);
	const allowCancel = canCancelOrder(ticket.status);

	return (
		<Card className="gap-4 border-dashed bg-background/80">
			<CardHeader className="gap-3">
				<div className="flex items-start justify-between gap-3">
					<div className="space-y-1">
						<CardTitle className="flex items-center gap-2 text-lg">
							<Ticket className="size-4 text-primary" />
							<span>Ticket #{ticket.dailyNumber}</span>
						</CardTitle>
						<CardDescription>Cuenta abierta lista para registrar pedidos antes de cobrar.</CardDescription>
					</div>
					<Badge variant={getOrderStatusBadgeVariant(ticket.status)}>
						{getOrderStatusLabel(ticket.status)}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="grid gap-3 sm:grid-cols-2">
					<div className="rounded-lg border bg-muted/30 p-3">
						<Text variant="caption" color="secondary" className="flex items-center gap-2 uppercase tracking-[0.12em]">
							<Clock3 className="size-3.5" />
							Fecha
						</Text>
						<p className="mt-2 text-sm font-medium text-text-primary">
							{format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm")}
						</p>
					</div>

					<div className="rounded-lg border bg-muted/30 p-3">
						<Text variant="caption" color="secondary" className="flex items-center gap-2 uppercase tracking-[0.12em]">
							<UserRound className="size-3.5" />
							Mesero asignado
						</Text>
						<p className="mt-2 text-sm font-medium text-text-primary">{assignedWaiter?.name ?? "Sin asignar"}</p>
					</div>
				</div>

				<div className="space-y-2">
					<Text variant="subTitle2">Seleccionar mesero</Text>
					<Select
						value={ticket.waiterCen ?? undefined}
						onValueChange={(value) => onAssignWaiter(ticket.ticketCen, value)}
						disabled={isLoadingWaiters || waiters.length === 0 || !orderIsOpen}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder={isLoadingWaiters ? "Cargando meseros..." : "Seleccionar mesero"} />
						</SelectTrigger>
						<SelectContent>
							{waiters.map((waiter) => (
								<SelectItem key={waiter.waiterCen} value={waiter.waiterCen}>
									{waiter.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</CardContent>

			<CardFooter className="justify-end gap-2">
				{allowCancel ? (
					<Button variant="destructive" onClick={() => onCancelOrder(ticket)} disabled={isCancelingOrder}>
						{isCancelingOrder ? "Cancelando..." : "Cancelar"}
					</Button>
				) : null}
				<Button variant="secondary" disabled={!orderIsOpen} onClick={() => onTakeOrder(ticket)}>
					Tomar pedido
				</Button>
				<Button variant="outline" disabled={!orderIsOpen || !ticket.waiterCen} onClick={() => onContinueToCheckout(ticket)}>
					Continuar a cobro
				</Button>
			</CardFooter>
		</Card>
	);
}
