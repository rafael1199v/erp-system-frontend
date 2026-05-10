import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import inventoryLookupApi from "../api/inventoryLookupApi";
import purchaseApi from "../api/purchaseApi";
import type { ProductContractDto } from "../types/inventory";
import { normalizeCen } from "../utils/cen";

type UsePurchaseOrderDetailParams = {
	companyCen: string | null;
	orderCen: string | null;
};

export const usePurchaseOrderDetail = ({ companyCen, orderCen }: UsePurchaseOrderDetailParams) => {
	const normalizedCompanyCen = normalizeCen(companyCen);
	const normalizedOrderCen = normalizeCen(orderCen);
	const canFetch = normalizedCompanyCen !== null && normalizedOrderCen !== null;

	const orderQuery = useQuery({
		queryKey: ["purchase-order-detail", normalizedCompanyCen, normalizedOrderCen],
		queryFn: async () => {
			const response = await purchaseApi.getOrder(normalizedCompanyCen ?? "", normalizedOrderCen ?? "");
			return response.data;
		},
		enabled: canFetch,
	});

	const productCens = orderQuery.data?.items.map((item) => item.productCen) ?? [];
	const uniqueProductCens = Array.from(new Set(productCens)).sort();

	const productsQuery = useQuery({
		queryKey: ["purchase-product-lookup", normalizedCompanyCen, uniqueProductCens],
		queryFn: async () => {
			if (uniqueProductCens.length === 0) return [] as ProductContractDto[];

			const response = await inventoryLookupApi.lookupProducts(normalizedCompanyCen ?? "", {
				productCens: uniqueProductCens,
			});
			return response.data;
		},
		enabled: canFetch && orderQuery.data !== undefined,
	});

	return {
		order: orderQuery.data ?? null,
		products: productsQuery.data ?? ([] as ProductContractDto[]),
		productsByCen: Object.fromEntries((productsQuery.data ?? []).map((product) => [product.productCen, product])),
		isLoading: orderQuery.isLoading || productsQuery.isLoading,
		isFetching: orderQuery.isFetching || productsQuery.isFetching,
		isError: orderQuery.isError || productsQuery.isError,
		refetch: orderQuery.refetch,
	};
};

export const useConfirmPurchaseOrder = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ companyCen, orderCen }: { companyCen: string; orderCen: string }) => {
			const response = await purchaseApi.confirmOrder(companyCen, orderCen);
			return response.data;
		},
		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({ queryKey: ["purchase-orders", variables.companyCen] });
			await queryClient.invalidateQueries({
				queryKey: ["purchase-order-detail", variables.companyCen, variables.orderCen],
			});
			await queryClient.invalidateQueries({ queryKey: ["dashboard-inventory-summary", variables.companyCen] });
			await queryClient.invalidateQueries({ queryKey: ["dashboard-low-stock", variables.companyCen] });
		},
	});
};
