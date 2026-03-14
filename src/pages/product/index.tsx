import { Title } from "@/ui/typography";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { useMemo } from "react";
import { useSelectedCompanyId } from "@/store/companyStore";
import { useNavigate } from "react-router";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/ui/select";
import { useProductCatalogData } from "./hooks/use-product-catalog-data";
import { type ProductActiveFilter, useProductCatalogFilters } from "./hooks/use-product-catalog-filters";

export default function ProductPage () {
    const companyId = useSelectedCompanyId();
    const nav = useNavigate();

    const {
        catalogRows,
        categories,
        isLoading,
        isError,
        refreshCatalog,
    } = useProductCatalogData(companyId);

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
        () => columns(nav, async () => {
            await refreshCatalog();
        }),
        [nav, refreshCatalog],
    );

    return (
        <div className="flex flex-col w-full h-full gap-4">
            <Title as="h1">
                Productos
            </Title>

            <Button
                variant="default" 
                className="cursor-pointer"
                onClick={() => {
                    nav("/products/form")
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
                        <SelectValue placeholder="Filtrar por categoria" />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>

                        {categories.map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ProductActiveFilter)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filtrar por estado" />
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
                    <DataTable
                        columns={tableColumns}
                        data={isLoading ? [] : filteredProducts}
                    />
                )}
            </div>
        </div>
        
    );
}