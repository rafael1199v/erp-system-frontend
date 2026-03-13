import { Button } from "@/ui/button";
import { Field, FieldError, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Title } from "@/ui/typography";
import { useSelectedCompanyId } from "@/store/companyStore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Combobox, type ComboboxOption } from "@/components/combobox";
import { ProductStatus } from "@/types/enum";
import type { CreateProduct, UpdateProduct } from "@/types/product";
import categoryService from "@/api/services/categoryService";
import unitService from "@/api/services/unitService";
import supplierService from "@/api/services/supplierService";
import productService from "@/api/services/productService";

const productSchema = z.object({
	name: z.string().nonempty("El nombre es requerido"),
	imageUrl: z.string().optional(),
	categoryId: z.string().min(1, "La categoría es requerida"),
	unitId: z.string().min(1, "La unidad es requerida"),
	supplierId: z.string().min(1, "El proveedor es requerido"),
	sellPrice: z.string().refine((val) => Number(val) > 0, {
		message: "El precio de venta debe ser mayor a 0",
	}),
	currentCost: z.string().min(1, "El costo es requerido"),
	reorderLevel: z.string().min(1, "El nivel de reorden es requerido"),
});

export default function ProductFormPage() {
	const companyId = useSelectedCompanyId() || "-1";
	const nav = useNavigate();

	const { id } = useParams();
	const isEditing = !!id;

	const [categoryOptions, setCategoryOptions] = useState<ComboboxOption[]>([]);
	const [unitOptions, setUnitOptions] = useState<ComboboxOption[]>([]);
	const [supplierOptions, setSupplierOptions] = useState<ComboboxOption[]>([]);

	const {
		control,
		handleSubmit,
		register,
		reset,
		formState: { errors },
	} = useForm<z.infer<typeof productSchema>>({
		resolver: zodResolver(productSchema),
		defaultValues: {
			name: "",
			imageUrl: "",
			categoryId: "",
			unitId: "",
			supplierId: "",
			sellPrice: "",
			currentCost: "",
			reorderLevel: "",
		},
	});

	useEffect(() => {
		const fetchProduct = async () => {
			const response = await productService.getProductWithCompany(Number(id));
			const productWithCompany = response.data;
			console.log(response.data);
			reset({
				name: productWithCompany.name,
				imageUrl: productWithCompany.imageUrl ?? "",
				categoryId: productWithCompany.categoryId.toString(),
				unitId: productWithCompany.unitId.toString(),
				supplierId: productWithCompany.supplierId.toString(),
				sellPrice: productWithCompany.sellPrice.toString(),
				currentCost: productWithCompany.currentCost.toString(),
				reorderLevel: productWithCompany.reorderLevel.toString()
			});
		}

		if(isEditing) {
			fetchProduct();	
		}
	}, [id, isEditing, reset]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [categoriesRes, unitsRes, suppliersRes] = await Promise.all([
					categoryService.getCategories(companyId),
					unitService.getUnits(companyId),
					supplierService.getSuppliers(companyId),
				]);

				setCategoryOptions(
					categoriesRes.data.map((c) => ({
						value: c.id.toString(),
						label: c.name,
					})),
				);

				setUnitOptions(
					unitsRes.data.map((u) => ({
						value: u.id.toString(),
						label: u.name,
					})),
				);

				setSupplierOptions(
					suppliersRes.data.map((s) => ({
						value: s.id.toString(),
						label: s.name,
					})),
				);
			} catch (error) {
				console.error("Error loading form data", error);
				toast.error("Error al cargar datos del formulario");
			}
		};

		fetchData();
	}, [companyId]);

	const onSubmit = async (values: z.infer<typeof productSchema>) => {
		const product: CreateProduct = {
			name: values.name,
			imageUrl: values.imageUrl || null,
			categoryId: Number.parseInt(values.categoryId),
			unitId: Number.parseInt(values.unitId),
			supplierId: Number.parseInt(values.supplierId),
			companyId: Number.parseInt(companyId),
			productStatusId: ProductStatus.AVAILABLE,
			sellPrice: Number.parseInt(values.sellPrice),
			currentCost: Number.parseInt(values.currentCost),
			reorderLevel: Number.parseInt(values.reorderLevel),
		};

		const updateProduct: UpdateProduct = {
			productId: Number(id),
			name: values.name,
			imageUrl: values.imageUrl || null,
			categoryId: Number.parseInt(values.categoryId),
			unitId: Number.parseInt(values.unitId),
			supplierId: Number.parseInt(values.supplierId),
			companyId: Number.parseInt(companyId),
			productStatusId: ProductStatus.AVAILABLE,
			sellPrice: Number.parseInt(values.sellPrice),
			currentCost: Number.parseInt(values.currentCost),
			reorderLevel: Number.parseInt(values.reorderLevel),
		}

		try {
			if(isEditing) {
				await productService.updateProduct(updateProduct);
				toast.success("Producto actualizado con éxito");
			}
			else {
				await productService.createProduct(product);
				toast.success("Producto creado con éxito");
			}			
			
			nav("/products");
		} catch (error) {
			console.error("Error creating product", error);
			toast.error("Error al crear el producto. Intente de nuevo.");
		}
	};

	return (
		<div className="flex flex-col gap-8 w-full h-full">
			<Title as="h1">Crear Producto</Title>

			<form
				onSubmit={handleSubmit(onSubmit)}
				className="w-full flex flex-col gap-4 items-start"
			>
				<Field className="w-1/2">
					<FieldLabel htmlFor="name">Nombre</FieldLabel>
					<Input
						id="name"
						placeholder="Nombre del producto"
						type="text"
						{...register("name")}
					/>
					<FieldError>{errors.name?.message}</FieldError>
				</Field>

				<Field className="w-1/2">
					<FieldLabel htmlFor="imageUrl">URL de imagen (opcional)</FieldLabel>
					<Input
						id="imageUrl"
						placeholder="https://ejemplo.com/imagen.png"
						type="text"
						{...register("imageUrl")}
					/>
				</Field>

				<Field className="w-1/2">
					<FieldLabel htmlFor="categoryId">Categoría</FieldLabel>
					<Controller
						name="categoryId"
						control={control}
						render={({ field }) => (
							<Combobox
								options={categoryOptions}
								value={field.value}
								onChange={field.onChange}
								placeholder="Seleccionar categoría"
								searchPlaceholder="Buscar categoría..."
								emptyText="No se encontró la categoría."
							/>
						)}
					/>
					<FieldError>{errors.categoryId?.message}</FieldError>
				</Field>

				<Field className="w-1/2">
					<FieldLabel htmlFor="unitId">Unidad</FieldLabel>
					<Controller
						name="unitId"
						control={control}
						render={({ field }) => (
							<Combobox
								options={unitOptions}
								value={field.value}
								onChange={field.onChange}
								placeholder="Seleccionar unidad"
								searchPlaceholder="Buscar unidad..."
								emptyText="No se encontró la unidad."
							/>
						)}
					/>
					<FieldError>{errors.unitId?.message}</FieldError>
				</Field>

				<Field className="w-1/2">
					<FieldLabel htmlFor="supplierId">Proveedor</FieldLabel>
					<Controller
						name="supplierId"
						control={control}
						render={({ field }) => (
							<Combobox
								options={supplierOptions}
								value={field.value}
								onChange={field.onChange}
								placeholder="Seleccionar proveedor"
								searchPlaceholder="Buscar proveedor..."
								emptyText="No se encontró el proveedor."
							/>
						)}
					/>
					<FieldError>{errors.supplierId?.message}</FieldError>
				</Field>

				<Field className="w-1/2">
					<FieldLabel htmlFor="sellPrice">Precio de venta</FieldLabel>
					<Input
						id="sellPrice"
						placeholder="0"
						type="number"
						{...register("sellPrice")}
						min={1}
					/>
					<FieldError>{errors.sellPrice?.message}</FieldError>
				</Field>

				<Field className="w-1/2">
					<FieldLabel htmlFor="currentCost">Costo actual</FieldLabel>
					<Input
						id="currentCost"
						placeholder="0"
						type="number"
						{...register("currentCost")}
						min={0}
					/>
					<FieldError>{errors.currentCost?.message}</FieldError>
				</Field>

				<Field className="w-1/2">
					<FieldLabel htmlFor="reorderLevel">Nivel de reorden</FieldLabel>
					<Input
						id="reorderLevel"
						placeholder="0"
						type="number"
						{...register("reorderLevel")}
						min={0}
					/>
					<FieldError>{errors.reorderLevel?.message}</FieldError>
				</Field>

				<Button type="submit" className="cursor-pointer w-1/3">
					Crear Producto
				</Button>
			</form>
		</div>
	);
}
