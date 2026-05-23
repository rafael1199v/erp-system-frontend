import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import purchaseApi from "../api/purchaseApi";
import type { CreatePurchaseOrderDto, PurchaseOrderQuery } from "../types/purchase";
import { normalizeCen } from "../utils/cen";

type UsePurchaseOrdersParams = {
	companyCen: string | null;
	query: PurchaseOrderQuery;
};

export const usePurchaseOrders = ({ companyCen, query }: UsePurchaseOrdersParams) => {
	const normalizedCompanyCen = normalizeCen(companyCen);

	return useQuery({
		queryKey: ["purchase-orders", normalizedCompanyCen, query],
		queryFn: async () => {
			const response = await purchaseApi.getOrders(normalizedCompanyCen ?? "", query);
			return response.data;
		},
		enabled: normalizedCompanyCen !== null,
		placeholderData: keepPreviousData,
	});
};

export const useCreatePurchaseOrder = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ companyCen, payload }: { companyCen: string; payload: CreatePurchaseOrderDto }) => {
			const response = await purchaseApi.createOrder(companyCen, payload);
			return response.data;
		},
		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({ queryKey: ["purchase-orders", variables.companyCen] });
		},
	});
};
