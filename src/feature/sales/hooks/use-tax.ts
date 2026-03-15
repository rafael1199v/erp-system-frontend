import taxApi from "../api/taxApi";
import { useQuery } from "@tanstack/react-query";

export const useTax = (companyId: number | null) => {
	const normalizedCompanyId = companyId ?? -1;

	return useQuery({
		queryKey: ["sales-tax", normalizedCompanyId],
		queryFn: async () => {
			const response = await taxApi.getGlobalTax(normalizedCompanyId);
			return response.data;
		},
		enabled: normalizedCompanyId > 0,
	});
};
