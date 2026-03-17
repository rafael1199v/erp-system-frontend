import { useQuery } from "@tanstack/react-query";
import waiterApi from "../api/waiterApi";

export const useWaiters = (companyId: number | null) => {
	const normalizedCompanyId = companyId ?? -1;

	return useQuery({
		queryKey: ["sales-waiters", normalizedCompanyId],
		queryFn: async () => {
			return (await waiterApi.getWaiters(normalizedCompanyId)).data;
		},
		enabled: normalizedCompanyId > 0
	});
};