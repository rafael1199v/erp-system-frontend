import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import categoryService from "@/api/services/categoryService";
import { DataTable } from "@/components/data-table";
import { useSelectedCompanyId } from "@/store/companyStore";
import type { Category } from "@/types/category";
import { Button } from "@/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Title } from "@/ui/typography";
import { type CategoryRow, getColumns } from "./columns";

export default function CategoryPage() {
	const selectedCompanyId = useSelectedCompanyId();
	const companyId = Number.parseInt(selectedCompanyId || "1", 10);

	const [allCategories, setAllCategories] = useState<Category[]>([]);
	const [createOpen, setCreateOpen] = useState<boolean>(false);
	const [editOpen, setEditOpen] = useState<boolean>(false);
	const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
	const [categoryName, setCategoryName] = useState<string>("");
	const [editingCategoryName, setEditingCategoryName] = useState<string>("");

	const fetchCategories = useCallback(async () => {
		const response = await categoryService.getCategories(selectedCompanyId || "-1");
		setAllCategories(response.data);
	}, [selectedCompanyId]);

	useEffect(() => {
		void fetchCategories();
	}, [fetchCategories]);

	const categories = useMemo(() => {
		return allCategories.filter((category) => category.companyId === companyId);
	}, [allCategories, companyId]);

	const handleCreateCategory = async () => {
		const normalizedName = categoryName.trim();

		if (!normalizedName) {
			return;
		}

		if (allCategories.map<string>((c) => c.name.toLowerCase()).includes(normalizedName.toLowerCase())) {
			toast.error("Una categoria con este nombre ya existe");
			return;
		}

		await categoryService.createCategory({ name: normalizedName, companyId: parseInt(selectedCompanyId || "-1") });

		await fetchCategories();
		setCategoryName("");
		setCreateOpen(false);
	};

	const handleEditCategory = useCallback((category: CategoryRow) => {
		setEditingCategory(category);
		setEditingCategoryName(category.name);
		setEditOpen(true);
	}, []);

	const handleUpdateCategory = async () => {
		if (!editingCategory) {
			return;
		}

		const normalizedName = editingCategoryName.trim();
		if (!normalizedName) {
			return;
		}

		const currentCategory = allCategories.find((category) => category.id === editingCategory.id);
		const currentName = currentCategory?.name.trim().toLowerCase() ?? "";
		if (currentName === normalizedName.toLowerCase()) {
			setEditingCategory(null);
			setEditingCategoryName("");
			setEditOpen(false);
			return;
		}

		const duplicatedName = allCategories.some(
			(category) => category.id !== editingCategory.id && category.name.toLowerCase() === normalizedName.toLowerCase(),
		);

		if (duplicatedName) {
			toast.error("Una categoria con este nombre ya existe");
			return;
		}

		await categoryService.updateCategory({
			id: editingCategory.id,
			name: normalizedName,
			companyId,
		});

		await fetchCategories();
		setEditingCategory(null);
		setEditingCategoryName("");
		setEditOpen(false);
	};

	const columns = useMemo(() => getColumns(handleEditCategory), [handleEditCategory]);

	return (
		<div className="flex flex-col w-full h-full gap-4">
			<Title as="h1">Categorias</Title>

			<Dialog open={createOpen} onOpenChange={setCreateOpen}>
				<DialogTrigger asChild>
					<Button className="w-fit cursor-pointer">Crear categoria</Button>
				</DialogTrigger>

				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle>Nueva categoria</DialogTitle>
						<DialogDescription>Ingresa el nombre de la categoria para crearla.</DialogDescription>
					</DialogHeader>

					<div className="grid gap-2">
						<Label htmlFor="category-name">Nombre</Label>
						<Input
							id="category-name"
							placeholder="Ej: Abarrotes"
							value={categoryName}
							onChange={(event) => setCategoryName(event.target.value)}
							maxLength={50}
						/>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setCreateOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleCreateCategory} disabled={!categoryName.trim()}>
							Crear
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={editOpen}
				onOpenChange={(isOpen) => {
					setEditOpen(isOpen);
					if (!isOpen) {
						setEditingCategory(null);
						setEditingCategoryName("");
					}
				}}
			>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle>Editar categoria</DialogTitle>
						<DialogDescription>Actualiza el nombre de la categoria.</DialogDescription>
					</DialogHeader>

					<div className="grid gap-2">
						<Label htmlFor="edit-category-name">Nombre</Label>
						<Input
							id="edit-category-name"
							placeholder="Ej: Abarrotes"
							value={editingCategoryName}
							onChange={(event) => setEditingCategoryName(event.target.value)}
							maxLength={50}
						/>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setEditOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleUpdateCategory} disabled={!editingCategoryName.trim()}>
							Guardar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<div className="h-full w-11/12">
				<DataTable
					columns={columns}
					data={categories.map<CategoryRow>((category) => {
						return {
							id: category.id,
							name: category.name,
						};
					})}
				/>
			</div>
		</div>
	);
}
