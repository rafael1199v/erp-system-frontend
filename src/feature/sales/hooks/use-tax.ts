import { useQuery } from "@tanstack/react-query";
import taxApi from "../api/taxApi";

export const useTax = (companyCen: string | null) => {
	const normalizedCompanyId = companyCen ?? "-1";

	return useQuery({
		queryKey: ["sales-tax", normalizedCompanyId],
		queryFn: async () => {
			const response = await taxApi.getGlobalTax(normalizedCompanyId);
			return response.data;
		},
		enabled: normalizedCompanyId !== "-1",
	});
};
