import type { Category, CreateCategory } from "@/types/category";
import apiClient from "../apiClient";

export enum CategoryApi {
	Category = "/inventory/category",
}

const getCategories = (companyId: string) => {
	return apiClient.get<Category[]>({
		url: `${CategoryApi.Category}/${companyId}`,
	});
};

const createCategory = (category: CreateCategory) => {
	return apiClient.post<void>({
		url: `${CategoryApi.Category}`,
		data: category,
	});
};

const updateCategory = (category: Category) => {
	return apiClient.put<void>({
		url: `${CategoryApi.Category}`,
		data: category,
	});
};

export default {
	getCategories,
	createCategory,
	updateCategory,
};
