import taxApi from "../api/taxApi";
import type { UpdateGlobalTaxRequest } from "../types/tax";
import { useMutation } from "@tanstack/react-query";

export const useUpdateTax = () => {
	return useMutation({
		mutationFn: async (payload: UpdateGlobalTaxRequest) => {
			await taxApi.updateGlobalTax(payload);
		},
	});
};
