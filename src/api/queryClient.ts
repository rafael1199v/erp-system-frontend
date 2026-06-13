import { QueryClient } from "@tanstack/react-query";
import { getApiError } from "./apiError";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: (failureCount, error) => {
				const status = getApiError(error)?.status;
				if (status) return false;
				return failureCount < 2;
			},
		},
	},
});
