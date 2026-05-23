import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import orderApi from "../api/orderApi";
import type { Ticket } from "../types/order";
import { normalizeCen } from "../utils/cen";

export const useRestaurantOrders = (companyCen: string | null) => {
	const normalizedCompanyCen = normalizeCen(companyCen);
	const queryKey = ["sales-tickets", normalizedCompanyCen] as const;
	const queryClient = useQueryClient();

	const ordersQuery = useQuery({
		queryKey,
		queryFn: async () => {
			return (await orderApi.getDailyTickets(normalizedCompanyCen ?? "")).data;
		},
		enabled: normalizedCompanyCen !== null,
	});

	const createRestaurantOrderMutation = useMutation({
		mutationFn: async (targetCompanyCen: string) => {
			await orderApi.createTicket(targetCompanyCen);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sales-tickets"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-daily-sales"] });
		},
	});

	const assignWaiter = async (targetCompanyCen: string, waiterCen: string | null, ticketCen: string) => {
		const safeCompanyCen = normalizeCen(targetCompanyCen);
		const safeWaiterCen = normalizeCen(waiterCen);
		const safeTicketCen = normalizeCen(ticketCen);

		if (!safeCompanyCen || !safeWaiterCen || !safeTicketCen) {
			return;
		}

		await orderApi.assignWaiter(safeCompanyCen, safeTicketCen, { waiterCen: safeWaiterCen });
		await ordersQuery.refetch();
	};

	return {
		orders: ordersQuery.data ?? ([] as Ticket[]),
		tickets: ordersQuery.data ?? ([] as Ticket[]),
		isLoadingRestaurantOrders: ordersQuery.isLoading,
		isCreatingRestaurantOrder: createRestaurantOrderMutation.isPending,
		createRestaurantOrder: async (targetCompanyCen: string) => {
			await createRestaurantOrderMutation.mutateAsync(targetCompanyCen);
		},
		createTicket: async (targetCompanyCen: string) => {
			await createRestaurantOrderMutation.mutateAsync(targetCompanyCen);
		},
		assignWaiter,
		assignTicketWaiter: assignWaiter,
	};
};
