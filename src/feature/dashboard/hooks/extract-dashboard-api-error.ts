import type { AxiosError } from "axios";
import type { BackendStringError } from "../types/dashboard";

const getErrorPayload = (error: unknown): unknown => {
	const axiosError = error as AxiosError;
	return axiosError?.response?.data;
};

export const extractDashboardApiError = (error: unknown): BackendStringError | null => {
	const payload = getErrorPayload(error);

	if (typeof payload === "string") {
		return payload;
	}

	if (typeof payload === "object" && payload !== null && "message" in payload) {
		const message = (payload as { message?: unknown }).message;
		if (typeof message === "string") {
			return message;
		}
	}

	return null;
};
