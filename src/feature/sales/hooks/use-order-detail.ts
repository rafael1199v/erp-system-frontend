import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import orderDetailApi from "../api/orderDetailApi";
import type {
	AvailableOrderProduct,
	CreateOrderDetailRequest,
	CreateOrderDetailResponse,
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

	const productsQuery = useQuery({
		queryKey: ["sales-order-detail-products", normalizedOrderId],
		queryFn: async () => {
			const response = await orderDetailApi.getProductsByRestaurantOrder(normalizedOrderId);
			return response.data;
		},
		enabled: enabled && normalizedOrderId > 0,
		placeholderData: keepPreviousData,
	});

	const orderDetailsQuery = useQuery({
		queryKey: ["sales-order-details", normalizedOrderId],
		queryFn: async() => {
			const response = await orderApi.getOrderDetails(normalizedOrderId);
			return response.data;
		}
	})

	const createOrderDetailMutation = useMutation({
		mutationFn: async (payload: CreateOrderDetailRequest) => {
			const response = await orderDetailApi.createOrderDetail(payload);
			return response.data;
		},
	});

	const updateOrderDetailMutation = useMutation({
		mutationFn: async (payload: UpdateOrderDetailQuantityRequest) => {
			await orderDetailApi.updateOrderDetail(payload);
		},
	});

	return {
		products: productsQuery.data ?? ([] as AvailableOrderProduct[]),
		isLoadingProducts: productsQuery.isLoading,
		isFetchingProducts: productsQuery.isFetching,
		hasProductsError: productsQuery.isError,
		isCreatingOrderDetail: createOrderDetailMutation.isPending,
		isUpdatingOrderDetail: updateOrderDetailMutation.isPending,
		createOrderDetail: async (payload: CreateOrderDetailRequest) => {
			const response = await createOrderDetailMutation.mutateAsync(payload);
			return extractOrderDetailId(response);
		},
		updateOrderDetail: async (payload: UpdateOrderDetailQuantityRequest) => {
			await updateOrderDetailMutation.mutateAsync(payload);
		},
		refetchProducts: productsQuery.refetch,
		orderDetails: orderDetailsQuery.data
	};
};
