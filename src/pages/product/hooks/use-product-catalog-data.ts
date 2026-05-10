import { useQuery } from "@tanstack/react-query";
import categoryService from "@/api/services/categoryService";
import productService from "@/api/services/productService";

export const useProductCatalogData = (companyCen: string | null) => {
	const normalizedCompanyCen = companyCen ?? "";

	const productCatalogQuery = useQuery({
		queryKey: ["product-catalog", normalizedCompanyCen],
		queryFn: async () => {
			const response = await productService.getProductCatalog(normalizedCompanyCen);
			return response.data;
		},
		enabled: normalizedCompanyCen.length > 0,
	});

	const categoriesQuery = useQuery({
		queryKey: ["categories", normalizedCompanyCen],
		queryFn: async () => {
			const response = await categoryService.getCategories(normalizedCompanyCen);
			return response.data;
		},
		enabled: normalizedCompanyCen.length > 0,
	});

	return {
		catalogRows: productCatalogQuery.data ?? [],
		categories: categoriesQuery.data ?? [],
		isLoading: productCatalogQuery.isLoading || categoriesQuery.isLoading,
		isError: productCatalogQuery.isError || categoriesQuery.isError,
		refreshCatalog: productCatalogQuery.refetch,
	};
};
