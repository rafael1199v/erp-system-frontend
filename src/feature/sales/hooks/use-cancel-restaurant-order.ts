import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import orderApi from "../api/orderApi";
import type { BackendStringError, CancelRestaurantOrderDto } from "../types/order";

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
		mutationFn: async (payload: CancelRestaurantOrderDto) => {
			await orderApi.cancelOrder(payload);
		},
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
			await queryClient.invalidateQueries({
				queryKey: ["sales-order-details", variables.restaurantOrderId],
			});
			await queryClient.invalidateQueries({
				queryKey: ["sales-order-tax", variables.restaurantOrderId],
			});
		},
	});

	return {
		cancelRestaurantOrder: async (payload: CancelRestaurantOrderDto) => {
			await cancelOrderMutation.mutateAsync(payload);
		},
		isCancelingRestaurantOrder: cancelOrderMutation.isPending,
	};
};
