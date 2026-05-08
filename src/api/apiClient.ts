import { GLOBAL_CONFIG } from "@/global-config";
import { t } from "@/locales/i18n";
import userStore from "@/store/userStore";
import axios, { type AxiosRequestConfig, type AxiosError, type AxiosResponse } from "axios";
import { toast } from "sonner";

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
			if (res.status === 200 || res.status === 201) return res;
			else throw new Error(t("sys.api.apiRequestFailed"));
		},
		(error: AxiosError) => {
			const { response, message } = error || {};
			const responseData = response?.data;
			const errMsg =
				typeof responseData === "string"
					? responseData
					: (responseData as { message?: string } | undefined)?.message || message || t("sys.api.errorMessage");
			toast.error(errMsg, { position: "top-center" });

			if (response?.status === 401) {
				userStore.getState().actions.clearUserInfoAndToken();
			}

			return Promise.reject(error);
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
	delete<T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.request<AxiosResponse<T>>({ ...config, method: "DELETE" });
	}
	request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.instance.request<any, T>(config);
	}
}

export default new APIClient(GLOBAL_CONFIG.apiBaseUrl);
