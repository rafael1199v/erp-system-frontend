import { useQuery } from "@tanstack/react-query";
import orderApi from "../api/orderApi";

export const useRestaurantOrder = (restaurantOrderId: number | null) => {
    const normalizedOrderId = restaurantOrderId ?? -1;

    const orderTaxQuery = useQuery({
        queryKey: ["sales-order-tax", normalizedOrderId],
        queryFn: async () => {
            const response = await orderApi.getOrderTax(normalizedOrderId);
            return response.data;
        }
    });

    return orderTaxQuery;
}