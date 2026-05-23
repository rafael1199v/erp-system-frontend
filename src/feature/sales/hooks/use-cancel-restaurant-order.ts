import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiError } from "@/api/apiError";
import orderApi from "../api/orderApi";
import type { BackendStringError, CancelTicketRequest } from "../types/order";
import { normalizeCen } from "../utils/cen";

type CancelTicketMutationPayload = CancelTicketRequest & {
	companyCen: string;
	ticketCen: string;
};

export const extractCancelOrderApiError = (error: unknown): BackendStringError | null => {
	return getApiError(error)?.message ?? null;
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
