import { getApiError } from "@/api/apiError";
import type { BackendStringError } from "../types/dashboard";

export const extractDashboardApiError = (error: unknown): BackendStringError | null => {
	return getApiError(error)?.message ?? null;
};
