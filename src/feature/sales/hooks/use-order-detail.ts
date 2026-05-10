import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import kdsApi from "../api/kdsApi";
import orderApi from "../api/orderApi";
import orderDetailApi from "../api/orderDetailApi";
import type {
	CreateTicketItemRequest,
	SalesCatalogProduct,
	SalesCatalogProductFilters,
	TicketItem,
	UpdateTicketItemRequest,
} from "../types/order-detail";
import { normalizeCen } from "../utils/cen";

type UseOrderDetailParams = {
	companyCen: string | null;
	ticketCen: string | null;
	catalogFilters?: SalesCatalogProductFilters;
	enabled: boolean;
};

type UpdateTicketItemMutationPayload = UpdateTicketItemRequest & {
	ticketItemCen: string;
};

type UpdateTicketItemStatusMutationPayload = {
	ticketItemCen: string;
	status: string;
};

export const useOrderDetail = ({ companyCen, ticketCen, catalogFilters, enabled }: UseOrderDetailParams) => {
	const normalizedCompanyCen = normalizeCen(companyCen);
	const normalizedTicketCen = normalizeCen(ticketCen);
	const canFetch = enabled && normalizedCompanyCen !== null && normalizedTicketCen !== null;
	const queryClient = useQueryClient();

	const productsQuery = useQuery({
		queryKey: ["sales-catalog-products", normalizedCompanyCen, catalogFilters],
		queryFn: async () => {
			const response = await orderDetailApi.getCatalogProducts(normalizedCompanyCen ?? "", catalogFilters);
			return response.data;
		},
		enabled: canFetch,
		placeholderData: keepPreviousData,
	});

	const sendOrderMutation = useMutation({
		mutationFn: async () => {
			await orderApi.sendTicketToKds(normalizedCompanyCen ?? "", normalizedTicketCen ?? "");
		},
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ["sales-ticket-items", normalizedCompanyCen, normalizedTicketCen] });
			queryClient.invalidateQueries({ queryKey: ["sales-kds-team-items", normalizedCompanyCen] });
		},
	});

	const orderDetailsQuery = useQuery({
		queryKey: ["sales-ticket-items", normalizedCompanyCen, normalizedTicketCen],
		queryFn: async () => {
			const response = await orderApi.getTicketItems(normalizedCompanyCen ?? "", normalizedTicketCen ?? "");
			return response.data;
		},
		enabled: canFetch,
	});

	const createOrderDetailMutation = useMutation({
		mutationFn: async (payload: CreateTicketItemRequest) => {
			const response = await orderDetailApi.createTicketItem(
				normalizedCompanyCen ?? "",
				normalizedTicketCen ?? "",
				payload,
			);
			return response.data;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["sales-ticket-items", normalizedCompanyCen, normalizedTicketCen],
			});
			await queryClient.invalidateQueries({
				queryKey: ["sales-ticket-totals", normalizedCompanyCen, normalizedTicketCen],
			});
		},
	});

	const updateOrderDetailMutation = useMutation({
		mutationFn: async (payload: UpdateTicketItemMutationPayload) => {
			await orderDetailApi.updateTicketItem(normalizedCompanyCen ?? "", normalizedTicketCen ?? "", payload.ticketItemCen, {
				quantity: payload.quantity,
				note: payload.note,
			});
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["sales-ticket-items", normalizedCompanyCen, normalizedTicketCen],
			});
			await queryClient.invalidateQueries({
				queryKey: ["sales-ticket-totals", normalizedCompanyCen, normalizedTicketCen],
			});
		},
	});

	const cancelOrderDetailMutation = useMutation({
		mutationFn: async (payload: UpdateTicketItemStatusMutationPayload) => {
			await kdsApi.updateTicketItemStatus(normalizedCompanyCen ?? "", payload.ticketItemCen, {
				status: payload.status,
			});
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["sales-ticket-items", normalizedCompanyCen, normalizedTicketCen],
			});
			await queryClient.invalidateQueries({ queryKey: ["sales-kds-team-items", normalizedCompanyCen] });
		},
	});

	const ticketTotalsQuery = useQuery({
		queryKey: ["sales-ticket-totals", normalizedCompanyCen, normalizedTicketCen],
		queryFn: async () => {
			const response = await orderApi.getTicketTotals(normalizedCompanyCen ?? "", normalizedTicketCen ?? "");
			return response.data;
		},
		enabled: canFetch,
	});

	return {
		products: productsQuery.data ?? ([] as SalesCatalogProduct[]),
		isLoadingProducts: productsQuery.isLoading,
		isFetchingProducts: productsQuery.isFetching,
		hasProductsError: productsQuery.isError,
		isCreatingOrderDetail: createOrderDetailMutation.isPending,
		isUpdatingOrderDetail: updateOrderDetailMutation.isPending,
		isCancelingOrderDetail: cancelOrderDetailMutation.isPending,
		isCreatingTicketItem: createOrderDetailMutation.isPending,
		isUpdatingTicketItem: updateOrderDetailMutation.isPending,
		isCancelingTicketItem: cancelOrderDetailMutation.isPending,
		createOrderDetail: async (payload: CreateTicketItemRequest) => {
			const response = await createOrderDetailMutation.mutateAsync(payload);
			return response.ticketItemCen;
		},
		createTicketItem: async (payload: CreateTicketItemRequest) => {
			const response = await createOrderDetailMutation.mutateAsync(payload);
			return response.ticketItemCen;
		},
		updateOrderDetail: async (payload: UpdateTicketItemMutationPayload) => {
			await updateOrderDetailMutation.mutateAsync(payload);
		},
		updateTicketItem: async (payload: UpdateTicketItemMutationPayload) => {
			await updateOrderDetailMutation.mutateAsync(payload);
		},
		cancelOrderDetail: async (payload: UpdateTicketItemStatusMutationPayload) => {
			await cancelOrderDetailMutation.mutateAsync(payload);
		},
		cancelTicketItem: async (payload: UpdateTicketItemStatusMutationPayload) => {
			await cancelOrderDetailMutation.mutateAsync(payload);
		},
		refetchProducts: productsQuery.refetch,
		orderDetails: orderDetailsQuery.data ?? ([] as TicketItem[]),
		ticketItems: orderDetailsQuery.data ?? ([] as TicketItem[]),
		ticketTotals: ticketTotalsQuery.data ?? null,
		isLoadingTicketTotals: ticketTotalsQuery.isLoading,
		sendOrderToTeam: async () => {
			await sendOrderMutation.mutateAsync();
		},
		sendTicketToKds: async () => {
			await sendOrderMutation.mutateAsync();
		},
	};
};
