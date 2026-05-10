import { useQuery } from "@tanstack/react-query";
import waiterApi from "../api/waiterApi";
import { normalizeCen } from "../utils/cen";

export const useWaiters = (companyCen: string | null) => {
	const normalizedCompanyCen = normalizeCen(companyCen);

	return useQuery({
		queryKey: ["sales-waiters", normalizedCompanyCen],
		queryFn: async () => {
			return (await waiterApi.getWaiters(normalizedCompanyCen ?? "")).data;
		},
		enabled: normalizedCompanyCen !== null,
	});
};
