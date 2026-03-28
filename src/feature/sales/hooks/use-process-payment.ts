import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import paymentApi from "../api/paymentApi";
import type {
	ProcessPaymentApiError,
	ProcessRestaurantOrderPaymentDto,
	ProcessRestaurantOrderPaymentStockFailure,
} from "../types/payment";

const isStockFailurePayload = (value: unknown): value is ProcessRestaurantOrderPaymentStockFailure => {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	const candidate = value as Partial<ProcessRestaurantOrderPaymentStockFailure>;
	return Array.isArray(candidate.insufficiencies);
};

const getErrorPayload = (error: unknown): unknown => {
	const axiosError = error as AxiosError;
	return axiosError?.response?.data;
};

export const extractProcessPaymentApiError = (error: unknown): ProcessPaymentApiError | null => {
	const payload = getErrorPayload(error);

	if (typeof payload === "string") {
		return payload;
	}

	if (isStockFailurePayload(payload)) {
		return payload;
	}

	return null;
};

export const useProcessPayment = () => {
	const queryClient = useQueryClient();

	const processPaymentMutation = useMutation({
		mutationFn: async (payload: ProcessRestaurantOrderPaymentDto) => {
			const response = await paymentApi.processPayment(payload);
			return response.data;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
			await queryClient.invalidateQueries({ queryKey: ["sales-order-details"] });
		},
	});

	return {
		isProcessingPayment: processPaymentMutation.isPending,
		processPayment: async (payload: ProcessRestaurantOrderPaymentDto) => {
			return processPaymentMutation.mutateAsync(payload);
		},
	};
};
