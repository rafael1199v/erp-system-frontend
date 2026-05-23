import type { Category, CreateCategory } from "@/types/category";
import apiClient from "../apiClient";

export enum CategoryApi {
	Inventory = "/inventory",
}

const getCategories = (companyCen: string) => {
	return apiClient.get<Category[]>({
		url: `${CategoryApi.Inventory}/companies/${encodeURIComponent(companyCen)}/categories`,
	});
};

const createCategory = (companyCen: string, category: CreateCategory) => {
	return apiClient.post<Category>({
		url: `${CategoryApi.Inventory}/companies/${encodeURIComponent(companyCen)}/categories`,
		data: category,
	});
};

const updateCategory = (companyCen: string, categoryCen: string, category: CreateCategory) => {
	return apiClient.put<Category>({
		url: `${CategoryApi.Inventory}/companies/${encodeURIComponent(companyCen)}/categories/${encodeURIComponent(categoryCen)}`,
		data: category,
	});
};

export default {
	getCategories,
	createCategory,
	updateCategory,
};
