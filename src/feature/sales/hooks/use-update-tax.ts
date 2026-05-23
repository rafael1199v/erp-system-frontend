import { useMutation, useQueryClient } from "@tanstack/react-query";
import taxApi from "../api/taxApi";
import type { TaxConfiguration } from "../types/tax";
import { normalizeCen } from "../utils/cen";

export const useUpdateTax = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: TaxConfiguration) => {
			const companyCen = normalizeCen(payload.companyCen);

			if (!companyCen) {
				throw new Error("No se pudo identificar la compania para actualizar el impuesto.");
			}

			await taxApi.updateGlobalTax(companyCen, { globalTaxPercentage: payload.globalTaxPercentage });
		},
		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({ queryKey: ["sales-tax", variables.companyCen] });
			await queryClient.invalidateQueries({ queryKey: ["sales-ticket-totals", variables.companyCen] });
		},
	});
};
