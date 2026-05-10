import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import orderApi from "../api/orderApi";
import type { BackendStringError, CancelTicketRequest } from "../types/order";
import { normalizeCen } from "../utils/cen";

type CancelTicketMutationPayload = CancelTicketRequest & {
	companyCen: string;
	ticketCen: string;
};

const getErrorPayload = (error: unknown): unknown => {
	const axiosError = error as AxiosError;
	return axiosError?.response?.data;
};

export const extractCancelOrderApiError = (error: unknown): BackendStringError | null => {
	const payload = getErrorPayload(error);

	if (typeof payload === "string") {
		return payload;
	}

	if (typeof payload === "object" && payload !== null && "message" in payload) {
		const message = (payload as { message?: unknown }).message;
		if (typeof message === "string") {
			return message;
		}
	}

	return null;
};

export const useCancelRestaurantOrder = () => {
	const queryClient = useQueryClient();

	const cancelOrderMutation = useMutation({
		mutationFn: async (payload: CancelTicketMutationPayload) => {
			const companyCen = normalizeCen(payload.companyCen);
			const ticketCen = normalizeCen(payload.ticketCen);

			if (!companyCen || !ticketCen) {
				throw new Error("No se pudo identificar la compania o el ticket para cancelar.");
			}

			await orderApi.cancelTicket(companyCen, ticketCen, { reason: payload.reason });
		},
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({ queryKey: ["sales-tickets", variables.companyCen] });
			await queryClient.invalidateQueries({
				queryKey: ["sales-ticket-items", variables.companyCen, variables.ticketCen],
			});
			await queryClient.invalidateQueries({
				queryKey: ["sales-ticket-totals", variables.companyCen, variables.ticketCen],
			});
		},
	});

	return {
		cancelRestaurantOrder: async (payload: CancelTicketMutationPayload) => {
			await cancelOrderMutation.mutateAsync(payload);
		},
		cancelTicket: async (payload: CancelTicketMutationPayload) => {
			await cancelOrderMutation.mutateAsync(payload);
		},
		isCancelingRestaurantOrder: cancelOrderMutation.isPending,
		isCancelingTicket: cancelOrderMutation.isPending,
	};
};
