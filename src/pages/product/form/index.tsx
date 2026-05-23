import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import categoryService from "@/api/services/categoryService";
import productService from "@/api/services/productService";
import unitService from "@/api/services/unitService";
import { Combobox, type ComboboxOption } from "@/components/combobox";
import { useSelectedCompanyCen } from "@/store/companyStore";
import type { CreateProduct, ProductContractStatus, UpdateProduct } from "@/types/product";
import { Button } from "@/ui/button";
import { Field, FieldError, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
//import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Title } from "@/ui/typography";

const productSchema = z.object({
	sku: z.string().nonempty("El SKU es requerido"),
	name: z.string().nonempty("El nombre es requerido"),
	description: z.string().optional(),
	categoryCen: z.string().min(1, "La categoria es requerida"),
	unitCen: z.string().min(1, "La unidad es requerida"),
	salePrice: z.string().refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
		message: "El precio de venta debe ser mayor a 0",
	}),
	costPrice: z
		.string()
		.optional()
		.refine((val) => !val || (!Number.isNaN(Number(val)) && Number(val) >= 0), {
			message: "El costo del producto no puede ser negativo",
		}),
	reorderLevel: z.string().refine((val) => Number.isInteger(Number(val)) && Number(val) >= 0, {
		message: "El nivel de reorden debe ser mayor o igual a 0",
	}),
	status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]),
});

type ProductFormValues = z.infer<typeof productSchema>;

const toNullableText = (value?: string) => {
	const normalizedValue = value?.trim();
	return normalizedValue ? normalizedValue : null;
};

export default function ProductFormPage() {
	const companyCen = useSelectedCompanyCen() || "";
	const nav = useNavigate();

	const { id } = useParams();
	const productCen = id ? decodeURIComponent(id) : null;
	const isEditing = Boolean(productCen);

	const [categoryOptions, setCategoryOptions] = useState<ComboboxOption[]>([]);
	const [unitOptions, setUnitOptions] = useState<ComboboxOption[]>([]);
	const [initialStatus, setInitialStatus] = useState<ProductContractStatus>("ACTIVE");

	const {
		control,
		handleSubmit,
		register,
		reset,
		formState: { errors },
	} = useForm<ProductFormValues>({
		resolver: zodResolver(productSchema),
		defaultValues: {
			sku: "",
			name: "",
			description: "",
			categoryCen: "",
			unitCen: "",
			salePrice: "",
			costPrice: "",
			reorderLevel: "",
			status: "ACTIVE",
		},
	});

	useEffect(() => {
		const fetchProduct = async () => {
			if (!companyCen || !productCen) return;

			const response = await productService.getProductCatalog(companyCen);
			const product = response.data.find((item) => item.productCen === productCen);

			if (!product) {
				toast.error("No se encontro el producto solicitado");
				nav("/products");
				return;
			}

			setInitialStatus(product.status);
			reset({
				sku: product.sku,
				name: product.name,
				description: product.description ?? "",
				categoryCen: product.categoryCen,
				unitCen: product.unitCen,
				salePrice: product.salePrice.toString(),
				costPrice: product.costPrice?.toString() ?? "",
				reorderLevel: product.reorderLevel.toString(),
				status: product.status,
			});
		};

		if (isEditing) {
			void fetchProduct();
		}
	}, [companyCen, isEditing, nav, productCen, reset]);

	useEffect(() => {
		const fetchData = async () => {
			if (!companyCen) return;

			try {
				const [categoriesRes, unitsRes] = await Promise.all([
					categoryService.getCategories(companyCen),
					unitService.getUnits(companyCen),
				]);

				setCategoryOptions(
					categoriesRes.data.map((category) => ({
						value: category.categoryCen,
						label: category.name,
					})),
				);

				setUnitOptions(
					unitsRes.data.map((unit) => ({
						value: unit.unitCen,
						label: unit.name,
					})),
				);
			} catch (error) {
				console.error("Error loading form data", error);
				toast.error("Error al cargar datos del formulario");
			}
		};

		void fetchData();
	}, [companyCen]);

	const onSubmit = async (values: ProductFormValues) => {
		if (!companyCen) {
			toast.error("Selecciona una compania antes de guardar el producto");
			return;
		}

		const productPayload: CreateProduct | UpdateProduct = {
			sku: values.sku.trim(),
			name: values.name.trim(),
			description: toNullableText(values.description),
			categoryCen: values.categoryCen,
			unitCen: values.unitCen,
			salePrice: Number.parseFloat(values.salePrice),
			costPrice: values.costPrice ? Number.parseFloat(values.costPrice) : null,
			reorderLevel: Number.parseInt(values.reorderLevel, 10),
		};

		try {
			if (isEditing && productCen) {
				await productService.updateProduct(companyCen, productCen, productPayload);

				if (values.status !== initialStatus) {
					await productService.updateProductStatus(companyCen, productCen, values.status);
				}

				toast.success("Producto actualizado con exito");
			} else {
				const response = await productService.createProduct(companyCen, productPayload);

				if (values.status !== "ACTIVE") {
					await productService.updateProductStatus(companyCen, response.data.productCen || values.sku, values.status);
				}

				toast.success("Producto creado con exito");
			}

			nav("/products");
		} catch (error) {
			console.error("Error saving product", error);
			toast.error("Error al guardar el producto. Intente de nuevo.");
		}
	};

	return (
		<div className="flex flex-col gap-8 w-full h-full">
			<Title as="h1">{isEditing ? "Editar Producto" : "Crear Producto"}</Title>

			<form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4 items-start">
				<Field className="w-1/2">
					<FieldLabel htmlFor="sku">SKU</FieldLabel>
					<Input id="sku" placeholder="SKU-HAMB-001" type="text" {...register("sku")} />
					<FieldError>{errors.sku?.message}</FieldError>
				</Field>

				<Field className="w-1/2">
					<FieldLabel htmlFor="name">Nombre</FieldLabel>
					<Input id="name" placeholder="Nombre del producto" type="text" {...register("name")} />
					<FieldError>{errors.name?.message}</FieldError>
				</Field>

				<Field className="w-1/2">
					<FieldLabel htmlFor="description">Descripcion</FieldLabel>
					<Input id="description" placeholder="Descripcion opcional" type="text" {...register("description")} />
				</Field>

				<Field className="w-1/2">
					<FieldLabel htmlFor="categoryCen">Categoria</FieldLabel>
					<Controller
						name="categoryCen"
						control={control}
						render={({ field }) => (
							<Combobox
								options={categoryOptions}
								value={field.value}
								onChange={field.onChange}
								placeholder="Seleccionar categoria"
								searchPlaceholder="Buscar categoria..."
								emptyText="No se encontro la categoria."
							/>
						)}
					/>
					<FieldError>{errors.categoryCen?.message}</FieldError>
				</Field>

				<Field className="w-1/2">
					<FieldLabel htmlFor="unitCen">Unidad</FieldLabel>
					<Controller
						name="unitCen"
						control={control}
						render={({ field }) => (
							<Combobox
								options={unitOptions}
								value={field.value}
								onChange={field.onChange}
								placeholder="Seleccionar unidad"
								searchPlaceholder="Buscar unidad..."
								emptyText="No se encontro la unidad."
							/>
						)}
					/>
					<FieldError>{errors.unitCen?.message}</FieldError>
				</Field>

				<Field className="w-1/2">
					<FieldLabel htmlFor="salePrice">Precio de venta</FieldLabel>
					<Input id="salePrice" placeholder="0.00" type="number" step="0.01" {...register("salePrice")} min={0.01} />
					<FieldError>{errors.salePrice?.message}</FieldError>
				</Field>

				<Field className="w-1/2">
					<FieldLabel htmlFor="costPrice">Costo actual</FieldLabel>
					<Input id="costPrice" placeholder="0.00" type="number" step="0.01" {...register("costPrice")} min={0} />
					<FieldError>{errors.costPrice?.message}</FieldError>
				</Field>

				<Field className="w-1/2">
					<FieldLabel htmlFor="reorderLevel">Nivel de reorden</FieldLabel>
					<Input id="reorderLevel" placeholder="0" type="number" {...register("reorderLevel")} min={0} />
					<FieldError>{errors.reorderLevel?.message}</FieldError>
				</Field>

				{/* <Field className="w-1/2">
					<FieldLabel htmlFor="status">Estado del producto</FieldLabel>
					<Controller
						name="status"
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Seleccionar estado" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ACTIVE">Activo</SelectItem>
									<SelectItem value="INACTIVE">Inactivo</SelectItem>
									<SelectItem value="OUT_OF_STOCK">Sin stock</SelectItem>
								</SelectContent>
							</Select>
						)}
					/>
					<FieldError>{errors.status?.message}</FieldError>
				</Field> */}

				<Button type="submit" className="cursor-pointer w-1/2">
					{isEditing ? "Editar producto" : "Crear producto"}
				</Button>
			</form>
		</div>
	);
}
