import { useMutation, useQueryClient } from "@tanstack/react-query";
import orderDetailApi from "../api/orderDetailApi";
import { normalizeCen } from "../utils/cen";

type UseResendOrderDetailParams = {
	companyCen: string | null;
	ticketCen: string | null;
};

export const useResendOrderDetail = ({ companyCen, ticketCen }: UseResendOrderDetailParams) => {
	const normalizedCompanyCen = normalizeCen(companyCen);
	const normalizedTicketCen = normalizeCen(ticketCen);
	const queryClient = useQueryClient();

	const resendMutation = useMutation({
		mutationFn: async (ticketItemCen: string) => {
			const normalizedTicketItemCen = normalizeCen(ticketItemCen);

			if (!normalizedCompanyCen || !normalizedTicketCen || !normalizedTicketItemCen) {
				throw new Error("No se pudo identificar el item del ticket para reenviar.");
			}

			await orderDetailApi.resendTicketItem(normalizedCompanyCen, normalizedTicketCen, normalizedTicketItemCen);
		},
		onSuccess: async () => {
			if (normalizedCompanyCen && normalizedTicketCen) {
				await queryClient.invalidateQueries({
					queryKey: ["sales-ticket-items", normalizedCompanyCen, normalizedTicketCen],
				});
			}
			await queryClient.invalidateQueries({ queryKey: ["sales-kds-team-items", normalizedCompanyCen] });
		},
	});

	return {
		isResendingOrderDetail: resendMutation.isPending,
		resendOrderDetail: async (ticketItemCen: string) => {
			await resendMutation.mutateAsync(ticketItemCen);
		},
		resendTicketItem: async (ticketItemCen: string) => {
			await resendMutation.mutateAsync(ticketItemCen);
		},
	};
};
