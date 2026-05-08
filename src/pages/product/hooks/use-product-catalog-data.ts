import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import categoryService from "@/api/services/categoryService";
import productService from "@/api/services/productService";
import type { ProductCatalogRow } from "../columns";

export const useProductCatalogData = (companyId: string | null) => {
	const normalizedCompanyId = companyId ?? "-1";

	const productCatalogQuery = useQuery({
		queryKey: ["product-catalog", normalizedCompanyId],
		queryFn: async () => {
			const response = await productService.getProductCatalog(normalizedCompanyId);
			return response.data;
		},
		enabled: normalizedCompanyId !== "-1",
	});

	const categoriesQuery = useQuery({
		queryKey: ["categories", normalizedCompanyId],
		queryFn: async () => {
			const response = await categoryService.getCategories(normalizedCompanyId);
			return response.data;
		},
		enabled: normalizedCompanyId !== "-1",
	});

	const catalogRows = useMemo<ProductCatalogRow[]>(() => {
		const companyIdAsNumber = Number.parseInt(normalizedCompanyId, 10);

		return (productCatalogQuery.data ?? []).map((product) => ({
			...product,
			companyId: Number.isNaN(companyIdAsNumber) ? -1 : companyIdAsNumber,
		}));
	}, [normalizedCompanyId, productCatalogQuery.data]);

	return {
		catalogRows,
		categories: categoriesQuery.data ?? [],
		isLoading: productCatalogQuery.isLoading || categoriesQuery.isLoading,
		isError: productCatalogQuery.isError || categoriesQuery.isError,
		refreshCatalog: productCatalogQuery.refetch,
	};
};
