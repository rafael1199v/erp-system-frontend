import { useMemo } from "react";
import { useNavigate } from "react-router";
import { DataTable } from "@/components/data-table";
import { useSelectedCompanyCen } from "@/store/companyStore";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Title } from "@/ui/typography";
import { columns } from "./columns";
import { useProductCatalogData } from "./hooks/use-product-catalog-data";
import { type ProductActiveFilter, useProductCatalogFilters } from "./hooks/use-product-catalog-filters";

export default function ProductPage() {
	const companyCen = useSelectedCompanyCen();
	const nav = useNavigate();

	const { catalogRows, categories, isLoading, isError, refreshCatalog } = useProductCatalogData(companyCen);

	const {
		searchTerm,
		selectedCategory,
		selectedStatus,
		filteredProducts,
		setSearchTerm,
		setSelectedCategory,
		setSelectedStatus,
	} = useProductCatalogFilters(catalogRows);

	const tableColumns = useMemo(
		() =>
			columns(
				nav,
				async () => {
					await refreshCatalog();
				},
				companyCen,
			),
		[nav, refreshCatalog, companyCen],
	);

	return (
		<div className="flex flex-col w-full h-full gap-4">
			<Title as="h1">Productos</Title>

			<Button
				variant="default"
				className="cursor-pointer w-11/12"
				onClick={() => {
					nav("/products/form");
				}}
			>
				Crear producto
			</Button>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-3 w-11/12">
				<Input
					placeholder="Buscar producto..."
					value={searchTerm}
					onChange={(event) => setSearchTerm(event.target.value)}
				/>

				<Select value={selectedCategory} onValueChange={setSelectedCategory}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Filtrar por categoria">
							{selectedCategory === "all" ? (
								<span className="text-muted-foreground">Filtrar por categoria</span>
							) : (
								categories.find((c) => c.categoryCen === selectedCategory)?.name
							)}
						</SelectValue>
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="all">Todas</SelectItem>

						{categories.map((category) => (
							<SelectItem key={category.categoryCen} value={category.categoryCen}>
								{category.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ProductActiveFilter)}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Filtrar por estado">
							{selectedStatus === "all" ? (
								<span className="text-muted-foreground">Filtrar por estado</span>
							) : selectedStatus === "active" ? (
								"Activos"
							) : (
								"Inactivos"
							)}
						</SelectValue>
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="all">Todos</SelectItem>
						<SelectItem value="active">Activos</SelectItem>
						<SelectItem value="inactive">Inactivos</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="h-full w-11/12">
				{isError ? (
					<div className="text-sm text-error-dark">No se pudo cargar el catalogo de productos.</div>
				) : (
					<DataTable columns={tableColumns} data={isLoading ? [] : filteredProducts} />
				)}
			</div>
		</div>
	);
}
