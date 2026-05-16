import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { toast } from "sonner";
import { GLOBAL_CONFIG } from "@/global-config";
import userStore from "@/store/userStore";
import { normalizeApiError } from "./apiError";

const createAxiosInstance = (baseURL: string) => {
	const instance = axios.create({
		baseURL,
		timeout: 50000,
		headers: { "Content-Type": "application/json;charset=utf-8" },
	});

	instance.interceptors.request.use(
		(config) => {
			config.headers.Authorization = "Bearer Token";
			return config;
		},
		(error) => Promise.reject(error),
	);

	instance.interceptors.response.use(
		(res: AxiosResponse) => {
			if (res.status >= 200 && res.status < 300) return res;
			throw normalizeApiError(new Error("Respuesta inesperada del servidor."));
		},
		(error: AxiosError) => {
			const apiError = normalizeApiError(error);
			toast.error(apiError.message, { position: "top-center" });

			if (apiError.traceId) {
				console.error("API traceId:", apiError.traceId);
			}

			if (apiError.status === 401) {
				userStore.getState().actions.clearUserInfoAndToken();
			}

			return Promise.reject(apiError);
		},
	);

	return instance;
};

class APIClient {
	private instance: ReturnType<typeof createAxiosInstance>;

	constructor(baseURL: string) {
		this.instance = createAxiosInstance(baseURL);
	}

	get<T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.request<AxiosResponse<T>>({ ...config, method: "GET" });
	}
	post<T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.request<AxiosResponse<T>>({ ...config, method: "POST" });
	}
	put<T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.request<AxiosResponse<T>>({ ...config, method: "PUT" });
	}
	patch<T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.request<AxiosResponse<T>>({ ...config, method: "PATCH" });
	}
	delete<T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.request<AxiosResponse<T>>({ ...config, method: "DELETE" });
	}
	request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.instance.request<any, T>(config);
	}
}

export default new APIClient(GLOBAL_CONFIG.apiBaseUrl);
