import { useQuery } from "@tanstack/react-query";
import orderApi from "../api/orderApi";

type useRestaurantOrderPdfParams = {
	restaurantOrderId: number | null;
};

export const useRestaurantOrderPdf = ({ restaurantOrderId }: useRestaurantOrderPdfParams) => {
	const normalizedOrderId = restaurantOrderId ?? -1;

	const orderPdfQuery = useQuery({
        queryKey: ["restaurant-order-pdf"],
		queryFn: async () => {
            const response = await orderApi.getOrderPdf(normalizedOrderId);
            return response.data;
        },
        enabled: false
	});

	return orderPdfQuery;
};
