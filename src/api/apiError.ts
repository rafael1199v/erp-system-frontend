import axios, { type AxiosError } from "axios";

export type ApiErrorStatus = number;

export type ApiProblemDetails = {
	status?: number;
	title?: string;
	detail?: string;
	instance?: string;
	traceId?: string;
	message?: string;
	Message?: string;
	messag?: string;
	requirements?: unknown;
	insufficiencies?: unknown;
	data?: unknown;
	[key: string]: unknown;
};

export type ApiError = {
	isApiError: true;
	status: ApiErrorStatus;
	message: string;
	title?: string;
	detail?: string;
	instance?: string;
	traceId?: string;
	requirements?: unknown;
	insufficiencies?: unknown;
	data?: unknown;
	businessData?: unknown;
	raw?: unknown;
	originalError?: unknown;
};

const DEFAULT_ERROR_MESSAGE = "No se pudo completar la accion. Intenta nuevamente.";

const statusMessages: Record<number, string> = {
	400: "Revisa los datos ingresados e intenta nuevamente.",
	401: "Tu sesion expiro. Inicia sesion nuevamente.",
	403: "No tienes permisos para realizar esta accion.",
	404: "No se encontro el recurso solicitado.",
	409: "La accion no puede completarse por el estado actual de la informacion.",
	422: "Revisa los datos ingresados e intenta nuevamente.",
	500: "Ocurrio un error inesperado. Intenta nuevamente en unos minutos.",
	502: "El servicio no esta disponible en este momento. Intenta nuevamente.",
	503: "El servicio no esta disponible en este momento. Intenta nuevamente.",
	504: "La solicitud tardo demasiado. Intenta nuevamente.",
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null;
};

const getStringValue = (value: unknown): string | undefined => {
	return typeof value === "string" && value.trim().length > 0 ? value : undefined;
};

const getStatusMessage = (status: number) => {
	return statusMessages[status] ?? DEFAULT_ERROR_MESSAGE;
};

const getBusinessData = (payload: ApiProblemDetails) => {
	if (payload.data !== undefined) {
		return payload.data;
	}

	if (payload.requirements !== undefined) {
		return payload.requirements;
	}

	if (payload.insufficiencies !== undefined) {
		return payload.insufficiencies;
	}

	return undefined;
};

export const isApiError = (error: unknown): error is ApiError => {
	return isRecord(error) && error.isApiError === true;
};

export const getApiError = (error: unknown): ApiError | null => {
	return isApiError(error) ? error : null;
};

export const getApiErrorMessage = (error: unknown, fallbackMessage = DEFAULT_ERROR_MESSAGE): string => {
	return getApiError(error)?.message ?? fallbackMessage;
};

export const normalizeApiError = (error: unknown): ApiError => {
	if (isApiError(error)) {
		return error;
	}

	if (axios.isAxiosError(error)) {
		return normalizeAxiosError(error);
	}

	if (error instanceof Error) {
		return {
			isApiError: true,
			status: 0,
			message: getStringValue(error.message) ?? DEFAULT_ERROR_MESSAGE,
			originalError: error,
		};
	}

	if (typeof error === "string") {
		return {
			isApiError: true,
			status: 0,
			message: getStringValue(error) ?? DEFAULT_ERROR_MESSAGE,
			raw: error,
			originalError: error,
		};
	}

	return {
		isApiError: true,
		status: 0,
		message: DEFAULT_ERROR_MESSAGE,
		raw: error,
		originalError: error,
	};
};

const normalizeAxiosError = (error: AxiosError): ApiError => {
	const status = error.response?.status ?? 0;
	const payload = error.response?.data;

	if (typeof payload === "string") {
		return {
			isApiError: true,
			status,
			message: getStringValue(payload) ?? getStatusMessage(status),
			raw: payload,
			originalError: error,
		};
	}

	if (isRecord(payload)) {
		const problem = payload as ApiProblemDetails;
		const detail = getStringValue(problem.detail);
		const legacyMessage =
			getStringValue(problem.message) ?? getStringValue(problem.Message) ?? getStringValue(problem.messag);
		const title = getStringValue(problem.title);

		return {
			isApiError: true,
			status: typeof problem.status === "number" ? problem.status : status,
			message: detail ?? legacyMessage ?? title ?? getStatusMessage(status),
			title,
			detail,
			instance: getStringValue(problem.instance),
			traceId: getStringValue(problem.traceId),
			requirements: problem.requirements,
			insufficiencies: problem.insufficiencies,
			data: problem.data,
			businessData: getBusinessData(problem),
			raw: problem,
			originalError: error,
		};
	}

	return {
		isApiError: true,
		status,
		message: getStringValue(error.message) ?? getStatusMessage(status),
		raw: payload,
		originalError: error,
	};
};
