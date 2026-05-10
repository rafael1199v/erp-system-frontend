import { useQuery } from "@tanstack/react-query";
import orderApi from "../api/orderApi";
import { normalizeCen } from "../utils/cen";

export const useRestaurantOrder = (companyCen: string | null, ticketCen: string | null) => {
	const normalizedCompanyCen = normalizeCen(companyCen);
	const normalizedTicketCen = normalizeCen(ticketCen);

	const orderTaxQuery = useQuery({
		queryKey: ["sales-ticket-totals", normalizedCompanyCen, normalizedTicketCen],
		queryFn: async () => {
			const response = await orderApi.getTicketTotals(normalizedCompanyCen ?? "", normalizedTicketCen ?? "");
			return response.data;
		},
		enabled: normalizedCompanyCen !== null && normalizedTicketCen !== null,
	});

	return orderTaxQuery;
};
