import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiError } from "@/api/apiError";
import paymentApi from "../api/paymentApi";
import type {
	ProcessPaymentApiError,
	ProcessTicketPaymentDto,
	ProcessTicketPaymentStockFailure,
} from "../types/payment";
import { normalizeCen } from "../utils/cen";

type ProcessTicketPaymentMutationPayload = ProcessTicketPaymentDto & {
	companyCen: string;
	ticketCen: string;
};

const isStockFailurePayload = (value: unknown): value is ProcessTicketPaymentStockFailure => {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	const candidate = value as Partial<ProcessTicketPaymentStockFailure>;
	return Array.isArray(candidate.insufficiencies) || Array.isArray(candidate.requirements);
};

export const extractProcessPaymentApiError = (error: unknown): ProcessPaymentApiError | null => {
	const apiError = getApiError(error);

	if (!apiError) {
		return null;
	}

	const possibleStockPayloads = [apiError.raw, apiError.data, apiError.businessData];
	const stockFailure = possibleStockPayloads.find(isStockFailurePayload);

	if (stockFailure) {
		return stockFailure;
	}

	return apiError.message;
};

export const useProcessPayment = () => {
	const queryClient = useQueryClient();

	const processPaymentMutation = useMutation({
		mutationFn: async (payload: ProcessTicketPaymentMutationPayload) => {
			const companyCen = normalizeCen(payload.companyCen);
			const ticketCen = normalizeCen(payload.ticketCen);

			if (!companyCen || !ticketCen) {
				throw new Error("No se pudo identificar la compania o el ticket para procesar el pago.");
			}

			const response = await paymentApi.processPayment(companyCen, ticketCen, {
				paymentMethodCode: payload.paymentMethodCode,
			});
			return response.data;
		},
		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({ queryKey: ["sales-tickets", variables.companyCen] });
			await queryClient.invalidateQueries({ queryKey: ["sales-ticket-items", variables.companyCen, variables.ticketCen] });
			await queryClient.invalidateQueries({ queryKey: ["sales-ticket-totals", variables.companyCen, variables.ticketCen] });
			await queryClient.invalidateQueries({ queryKey: ["dashboard-daily-sales", variables.companyCen] });
			await queryClient.invalidateQueries({ queryKey: ["dashboard-top-products", variables.companyCen] });
		},
	});

	return {
		isProcessingPayment: processPaymentMutation.isPending,
		processPayment: async (payload: ProcessTicketPaymentMutationPayload) => {
			return processPaymentMutation.mutateAsync(payload);
		},
	};
};
