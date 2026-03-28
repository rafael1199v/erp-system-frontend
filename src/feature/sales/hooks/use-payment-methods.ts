import { useQuery } from "@tanstack/react-query";
import paymentApi from "../api/paymentApi";

export const usePaymentMethods = () => {
	const paymentMethodsQuery = useQuery({
		queryKey: ["sales-payment-methods"],
		queryFn: async () => {
			const response = await paymentApi.getPaymentMethods();
			return response.data;
		},
	});

	return {
		paymentMethods: paymentMethodsQuery.data ?? [],
		isLoadingPaymentMethods: paymentMethodsQuery.isLoading,
		isErrorPaymentMethods: paymentMethodsQuery.isError,
		refetchPaymentMethods: paymentMethodsQuery.refetch,
	};
};
