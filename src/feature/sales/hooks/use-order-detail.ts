import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import kdsApi from "../api/kdsApi";
import orderDetailApi from "../api/orderDetailApi";
import type {
	AvailableOrderProduct,
	CreateOrderDetailRequest,
	CreateOrderDetailResponse,
	UpdateOrderDetailStatusRequest,
	UpdateOrderDetailQuantityRequest,
} from "../types/order-detail";
import orderApi from "../api/orderApi";

type UseOrderDetailParams = {
	restaurantOrderId: number | null;
	enabled: boolean;
};

const extractOrderDetailId = (response: CreateOrderDetailResponse) => {
	return response.restaurantOrderDetailId;
};

export const useOrderDetail = ({ restaurantOrderId, enabled }: UseOrderDetailParams) => {
	const normalizedOrderId = restaurantOrderId ?? -1;
	const queryClient = useQueryClient();

	const productsQuery = useQuery({
		queryKey: ["sales-order-detail-products", normalizedOrderId],
		queryFn: async () => {
			const response = await orderDetailApi.getProductsByRestaurantOrder(normalizedOrderId);
			return response.data;
		},
		enabled: enabled && normalizedOrderId > 0,
		placeholderData: keepPreviousData,
	});

	const sendOrderMutation = useMutation({
		mutationFn: async () => {
			await orderApi.sendOrderToTeams(normalizedOrderId);
		},
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ["sales-order-details"] });
		},
	})

	const orderDetailsQuery = useQuery({
		queryKey: ["sales-order-details", normalizedOrderId],
		queryFn: async() => {
			const response = await orderApi.getOrderDetails(normalizedOrderId);
			return response.data;
		},
		enabled: enabled && normalizedOrderId > 0,
	})

	const createOrderDetailMutation = useMutation({
		mutationFn: async (payload: CreateOrderDetailRequest) => {
			const response = await orderDetailApi.createOrderDetail(payload);
			return response.data;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["sales-order-details", normalizedOrderId] });
		},
	});

	const updateOrderDetailMutation = useMutation({
		mutationFn: async (payload: UpdateOrderDetailQuantityRequest) => {
			await orderDetailApi.updateOrderDetail(payload);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["sales-order-details", normalizedOrderId] });
		},
	});

	const cancelOrderDetailMutation = useMutation({
		mutationFn: async (payload: UpdateOrderDetailStatusRequest) => {
			await kdsApi.updateRestaurantOrderDetailStatus(payload);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["sales-order-details", normalizedOrderId] });
		},
	});

	return {
		products: productsQuery.data ?? ([] as AvailableOrderProduct[]),
		isLoadingProducts: productsQuery.isLoading,
		isFetchingProducts: productsQuery.isFetching,
		hasProductsError: productsQuery.isError,
		isCreatingOrderDetail: createOrderDetailMutation.isPending,
		isUpdatingOrderDetail: updateOrderDetailMutation.isPending,
		isCancelingOrderDetail: cancelOrderDetailMutation.isPending,
		createOrderDetail: async (payload: CreateOrderDetailRequest) => {
			const response = await createOrderDetailMutation.mutateAsync(payload);
			return extractOrderDetailId(response);
		},
		updateOrderDetail: async (payload: UpdateOrderDetailQuantityRequest) => {
			await updateOrderDetailMutation.mutateAsync(payload);
		},
		cancelOrderDetail: async (payload: UpdateOrderDetailStatusRequest) => {
			await cancelOrderDetailMutation.mutateAsync(payload);
		},
		refetchProducts: productsQuery.refetch,
		orderDetails: orderDetailsQuery.data,
		sendOrderToTeam: async() => {
			await sendOrderMutation.mutateAsync();
		}
	};
};
