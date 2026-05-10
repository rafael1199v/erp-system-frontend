import { useMutation } from "@tanstack/react-query";
import taxApi from "../api/taxApi";
import type { TaxConfiguration } from "../types/tax";

export const useUpdateTax = () => {
	return useMutation({
		mutationFn: async (payload: TaxConfiguration) => {
			await taxApi.updateGlobalTax(payload.companyCen, { globalTaxPercentage: payload.globalTaxPercentage });
		},
	});
};
