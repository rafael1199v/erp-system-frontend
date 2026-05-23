import { useEffect, useMemo, useState } from "react";
import type { ProductCatalogRow } from "../columns";

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
				normalizedSearchTerm.length === 0 ||
				product.name.toLocaleLowerCase().includes(normalizedSearchTerm) ||
				product.sku.toLocaleLowerCase().includes(normalizedSearchTerm) ||
				product.productCen.toLocaleLowerCase().includes(normalizedSearchTerm);

			const matchesCategory = selectedCategory === "all" || product.categoryCen === selectedCategory;

			const matchesStatus =
				selectedStatus === "all" ||
				(selectedStatus === "active" && product.status === "ACTIVE") ||
				(selectedStatus === "inactive" && product.status !== "ACTIVE");

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
