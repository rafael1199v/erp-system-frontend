import { useQuery } from "@tanstack/react-query";
import taxApi from "../api/taxApi";
import { normalizeCen } from "../utils/cen";

export const useTax = (companyCen: string | null) => {
	const normalizedCompanyCen = normalizeCen(companyCen);

	return useQuery({
		queryKey: ["sales-tax", normalizedCompanyCen],
		queryFn: async () => {
			const response = await taxApi.getGlobalTax(normalizedCompanyCen ?? "");
			return response.data;
		},
		enabled: normalizedCompanyCen !== null,
	});
};
