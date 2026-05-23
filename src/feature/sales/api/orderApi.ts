import apiClient from "@/api/apiClient";
import type {
	AssignTicketWaiterRequest,
	AssignTicketWaiterResponse,
	CancelTicketRequest,
	CancelTicketResponse,
	CreateTicketRequest,
	Ticket,
	TicketTotals,
} from "../types/order";
import type { TicketItem } from "../types/order-detail";

export enum SalesOrderApi {
	Sales = "/sales",
}

const companyTicketsUrl = (companyCen: string) =>
	`${SalesOrderApi.Sales}/companies/${encodeURIComponent(companyCen)}/tickets`;

const ticketUrl = (companyCen: string, ticketCen: string) =>
	`${companyTicketsUrl(companyCen)}/${encodeURIComponent(ticketCen)}`;

const createTicket = (companyCen: string, payload: CreateTicketRequest = {}) => {
	return apiClient.post<Ticket>({
		url: companyTicketsUrl(companyCen),
		data: payload,
	});
};

const getDailyTickets = (companyCen: string) => {
	return apiClient.get<Ticket[]>({
		url: companyTicketsUrl(companyCen),
	});
};

const assignWaiter = (companyCen: string, ticketCen: string, payload: AssignTicketWaiterRequest) => {
	return apiClient.put<AssignTicketWaiterResponse>({
		url: `${ticketUrl(companyCen, ticketCen)}/waiter`,
		data: payload,
	});
};

const getTicketItems = (companyCen: string, ticketCen: string) => {
	return apiClient.get<TicketItem[]>({
		url: `${ticketUrl(companyCen, ticketCen)}/items`,
	});
};

const sendTicketToKds = (companyCen: string, ticketCen: string) => {
	return apiClient.post<TicketItem[]>({
		url: `${ticketUrl(companyCen, ticketCen)}/send`,
	});
};

const getTicketTotals = (companyCen: string, ticketCen: string) => {
	return apiClient.get<TicketTotals>({
		url: `${ticketUrl(companyCen, ticketCen)}/totals`,
	});
};

const getTicketPdf = (companyCen: string, ticketCen: string) => {
	return apiClient.get<Blob>({
		url: `${ticketUrl(companyCen, ticketCen)}/print`,
		responseType: "blob",
	});
};

const cancelTicket = (companyCen: string, ticketCen: string, payload: CancelTicketRequest = {}) => {
	return apiClient.post<CancelTicketResponse>({
		url: `${ticketUrl(companyCen, ticketCen)}/cancel`,
		data: payload,
	});
};

export default {
	createTicket,
	getDailyTickets,
	assignWaiter,
	getTicketItems,
	sendTicketToKds,
	getTicketTotals,
	getTicketPdf,
	cancelTicket,
};
