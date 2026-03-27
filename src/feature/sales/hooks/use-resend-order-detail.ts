import { useMutation, useQueryClient } from "@tanstack/react-query";
import orderDetailApi from "../api/orderDetailApi";

type UseResendOrderDetailParams = {
	restaurantOrderId: number | null;
};

export const useResendOrderDetail = ({ restaurantOrderId }: UseResendOrderDetailParams) => {
	const normalizedOrderId = restaurantOrderId ?? -1;
	const queryClient = useQueryClient();

	const resendMutation = useMutation({
		mutationFn: async (restaurantOrderDetailId: number) => {
			await orderDetailApi.resendOrderDetail(restaurantOrderDetailId);
		},
		onSuccess: async () => {
			if (normalizedOrderId > 0) {
				await queryClient.invalidateQueries({ queryKey: ["sales-order-details", normalizedOrderId] });
			}
			await queryClient.invalidateQueries({ queryKey: ["sales-kds-team-items"] });
		},
	});

	return {
		isResendingOrderDetail: resendMutation.isPending,
		resendOrderDetail: async (restaurantOrderDetailId: number) => {
			await resendMutation.mutateAsync(restaurantOrderDetailId);
		},
	};
};
