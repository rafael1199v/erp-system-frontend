import { useQuery } from "@tanstack/react-query";
import orderApi from "../api/orderApi";
import { normalizeCen } from "../utils/cen";

type useRestaurantOrderPdfParams = {
	companyCen: string | null;
	ticketCen: string | null;
};

export const useRestaurantOrderPdf = ({ companyCen, ticketCen }: useRestaurantOrderPdfParams) => {
	const normalizedCompanyCen = normalizeCen(companyCen);
	const normalizedTicketCen = normalizeCen(ticketCen);

	const orderPdfQuery = useQuery({
		queryKey: ["sales-ticket-pdf", normalizedCompanyCen, normalizedTicketCen],
		queryFn: async () => {
			const response = await orderApi.getTicketPdf(normalizedCompanyCen ?? "", normalizedTicketCen ?? "");
			return response.data;
		},
		enabled: false,
	});

	return orderPdfQuery;
};
