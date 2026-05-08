import { useMutation } from "@tanstack/react-query";
import taxApi from "../api/taxApi";
import type { UpdateGlobalTaxRequest } from "../types/tax";

export const useUpdateTax = () => {
	return useMutation({
		mutationFn: async (payload: UpdateGlobalTaxRequest) => {
			await taxApi.updateGlobalTax(payload);
		},
	});
};
