export type TicketStatus = "created" | "open" | "paid" | "Paid" | "canceled" | "cancelled" | string;

export type CreateTicketRequest = {
	waiterCen?: string | null;
};

export type Ticket = {
	ticketCen: string;
	dailyNumber: number;
	status: TicketStatus;
	createdAt: string;
	waiterCen?: string | null;
	companyCen?: string | null;
	taxAmount: number;
};

export type AssignTicketWaiterRequest = {
	waiterCen: string;
};

export type AssignTicketWaiterResponse = {
	ticketCen: string;
	waiterCen: string;
	waiterName: string;
};

export type CancelTicketRequest = {
	reason?: string | null;
};

export type CancelTicketResponse = {
	ticketCen: string;
	status: string;
};

export type TicketTotals = {
	ticketCen: string;
	subtotal: number;
	taxAmount: number;
	total: number;
};

export type BackendStringError = string;

export type Waiter = {
	waiterCen: string;
	name: string;
};

export type TicketLocationState = {
	ticket?: Ticket;
};
