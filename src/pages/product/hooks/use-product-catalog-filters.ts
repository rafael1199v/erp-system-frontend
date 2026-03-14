import type { ProductCatalogRow } from "../columns";
import { useEffect, useMemo, useState } from "react";

export type ProductActiveFilter = "all" | "active" | "inactive";

export const useProductCatalogFilters = (products: ProductCatalogRow[]) => {
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [selectedStatus, setSelectedStatus] = useState<ProductActiveFilter>("all");

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 400);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [searchTerm]);

	const filteredProducts = useMemo(() => {
		const normalizedSearchTerm = debouncedSearchTerm.trim().toLocaleLowerCase();

		return products.filter((product) => {
			const matchesSearch =
				normalizedSearchTerm.length === 0 || product.productName.toLocaleLowerCase().includes(normalizedSearchTerm);

			const matchesCategory = selectedCategory === "all" || product.categoryId === Number(selectedCategory);

			const matchesStatus =
				selectedStatus === "all" ||
				(selectedStatus === "active" && product.isActive) ||
				(selectedStatus === "inactive" && !product.isActive);

			return matchesSearch && matchesCategory && matchesStatus;
		});
	}, [debouncedSearchTerm, products, selectedCategory, selectedStatus]);

	return {
		searchTerm,
		selectedCategory,
		selectedStatus,
		filteredProducts,
		setSearchTerm,
		setSelectedCategory,
		setSelectedStatus,
	};
};
