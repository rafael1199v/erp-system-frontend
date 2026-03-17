import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import orderApi from "../api/orderApi";
import type { RestaurantOrder } from "../types/order";

export const useRestaurantOrders = (companyId: number | null) => {
	const normalizedCompanyId = companyId ?? -1;
	const queryKey = ["sales-orders", normalizedCompanyId] as const;
	const queryClient = useQueryClient();

	const ordersQuery = useQuery({
		queryKey,
		queryFn: async () => {
			return (await orderApi.getDailyOrders(companyId ?? -1)).data;
		},
		enabled: normalizedCompanyId > 0,
	});

	const createRestaurantOrderMutation = useMutation({
		mutationFn: async (targetCompanyId: number) => {
			await orderApi.createOrder({ companyId: targetCompanyId });
		},
		onSuccess: () => {
			//TODO: Invalidar querys al momento de obtener los tickers
			queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
			console.log("Ticket creado con exito");
		},
	});

	const assignWaiter = async (targetCompanyId: number, waiterId: number | null, restaurantOrderId: number) => {
		if (!Number.isInteger(targetCompanyId) || targetCompanyId <= 0 || waiterId === null) {
			return;
		}

		await orderApi.assignWaiter({ restaurantOrderId, waiterId });
		await ordersQuery.refetch();
	};

	return {
		orders: ordersQuery.data ?? ([] as RestaurantOrder[]),
		isLoadingRestaurantOrders: ordersQuery.isLoading,
		isCreatingRestaurantOrder: createRestaurantOrderMutation.isPending,
		createRestaurantOrder: async (targetCompanyId: number) => {
			await createRestaurantOrderMutation.mutateAsync(targetCompanyId);
		},
		assignWaiter,
	};
};
