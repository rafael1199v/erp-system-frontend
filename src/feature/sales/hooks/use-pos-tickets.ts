import { useMutation, useQuery } from "@tanstack/react-query";
import orderApi from "../api/orderApi";
import type { RestaurantOrder } from "../types/order";


export const useRestaurantOrders = (companyId: number | null) => {
	const normalizedCompanyId = companyId ?? -1;
	const queryKey = ["sales-orders", normalizedCompanyId] as const;

	const ordersQuery = useQuery({
		queryKey,
		queryFn: () => [],
		enabled: normalizedCompanyId > 0
	});

	const createRestaurantOrderMutation = useMutation({
		mutationFn: async (targetCompanyId: number) => {
			await orderApi.createOrder({ companyId: targetCompanyId });
		},
		onSuccess: () => {
			//TODO: Invalidar querys al momento de obtener los tickers
            console.log("Ticket creado con exito");
		},
	});

	const assignWaiter = (targetCompanyId: number, ticketId: number, waiterId: number | null) => {
		if (!Number.isInteger(targetCompanyId) || targetCompanyId <= 0) {
			return;
		}

		console.log(`Asigning waiter ${waiterId} to the ticket ${ticketId} for the company ${targetCompanyId}`)
	};

	return {
		orders: ordersQuery.data ?? [] as RestaurantOrder[],
		isLoadingRestaurantOrders: ordersQuery.isLoading,
		isCreatingRestaurantOrder: createRestaurantOrderMutation.isPending,
		createRestaurantOrder: async (targetCompanyId: number) => {
			await createRestaurantOrderMutation.mutateAsync(targetCompanyId);
		},
		assignWaiter,
	};
};
