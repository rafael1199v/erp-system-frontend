import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import movementService from "@/api/services/movementService";
import productService from "@/api/services/productService";
import warehouseService from "@/api/services/warehouseService";
import { Combobox, type ComboboxOption } from "@/components/combobox";
import { useSelectedCompanyCen } from "@/store/companyStore";
import type { CreateMovement } from "@/types/movement";
import { Button } from "@/ui/button";
import { Field, FieldError, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Title } from "@/ui/typography";

const movementSchema = z.object({
	reason: z.string().nonempty("El motivo es requerido"),
	products: z
		.array(
			z.object({
				productCen: z.string().min(1, "Seleccione un producto"),
				warehouseCen: z.string().min(1, "Seleccione un almacen"),
				quantity: z.string().min(1, "La cantidad debe ser positiva"),
			}),
		)
		.min(1, "Agrega por lo menos un producto para registrar una entrada"),
});

type MovementFormValues = z.infer<typeof movementSchema>;

export default function MovementForm() {
	const companyCen = useSelectedCompanyCen() || "";
	const [productOptions, setProductOptions] = useState<ComboboxOption[]>([]);
	const [warehouseOptions, setWarehouseOptions] = useState<ComboboxOption[]>([]);
	const nav = useNavigate();

	const {
		control,
		handleSubmit,
		register,
		formState: { errors },
		trigger,
	} = useForm<MovementFormValues>({
		resolver: zodResolver(movementSchema),
		defaultValues: {
			reason: "",
			products: [{ productCen: "", warehouseCen: "", quantity: "" }],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "products",
	});

	useEffect(() => {
		const fetchData = async () => {
			if (!companyCen) return;

			try {
				const [warehousesResponse, productsResponse] = await Promise.all([
					warehouseService.getWarehousesByCompany(companyCen),
					productService.getProductCatalog(companyCen),
				]);

				setWarehouseOptions(
					warehousesResponse.data.map((warehouse) => ({
						value: warehouse.warehouseCen,
						label: warehouse.name,
					})),
				);
				setProductOptions(
					productsResponse.data.map((product) => ({
						value: product.productCen,
						label: product.name,
					})),
				);
			} catch (error) {
				console.error(error);
			}
		};

		void fetchData();
	}, [companyCen]);

	const onSubmit = async (values: MovementFormValues) => {
		await trigger("products");

		if (!companyCen) {
			toast.error("Selecciona una compania antes de crear movimientos");
			return;
		}

		const movements = Array.from(
			values.products
				.reduce((warehouseLines, transaction) => {
					const lines = warehouseLines.get(transaction.warehouseCen) ?? [];
					lines.push({
						productCen: transaction.productCen,
						quantity: Number.parseInt(transaction.quantity, 10),
					});
					warehouseLines.set(transaction.warehouseCen, lines);
					return warehouseLines;
				}, new Map<string, CreateMovement["lines"]>())
				.entries(),
		).map<CreateMovement>(([warehouseCen, lines]) => ({
			documentType: "ENTRY",
			warehouseCen,
			reason: values.reason,
			externalReference: null,
			lines,
		}));

		try {
			await Promise.all(movements.map((movement) => movementService.createMovement(companyCen, movement)));
			toast.success("Movimiento creado con exito");
			nav("/movements/incoming");
		} catch (error) {
			console.error("Form submission error", error);
			toast.error("Failed to submit the form. Please try again.");
		}
	};

	return (
		<div className="flex flex-col gap-8 w-full h-full">
			<Title as="h1">Movimientos de Entrada</Title>

			<form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4 justify-content items-start">
				<Field className="w-1/2">
					<FieldLabel htmlFor="reason">Motivo</FieldLabel>
					<Input id="reason" placeholder="Motivo de la entrada" type="text" {...register("reason")} />
					<FieldError>{errors.reason?.message}</FieldError>
				</Field>

				{fields.map((field, index) => (
					<div className="w-full flex flex-row gap-4 pe-8 pb-8 pt-4 items-center justify-content" key={field.id}>
						<Field>
							<FieldLabel htmlFor={`products.${index}.productCen`}>Product</FieldLabel>
							<Controller
								name={`products.${index}.productCen`}
								control={control}
								render={({ field }) => (
									<Combobox
										options={productOptions}
										value={field.value}
										onChange={field.onChange}
										placeholder="Select a product"
										searchPlaceholder="Search products..."
										emptyText="No product found."
									/>
								)}
							/>
							<FieldError>{errors.products?.[index]?.productCen?.message}</FieldError>
						</Field>
						<Field>
							<FieldLabel htmlFor={`products.${index}.warehouseCen`}>Warehouse</FieldLabel>
							<Controller
								name={`products.${index}.warehouseCen`}
								control={control}
								render={({ field }) => (
									<Combobox
										options={warehouseOptions}
										value={field.value}
										onChange={field.onChange}
										placeholder="Select a warehouse"
										searchPlaceholder="Search warehouses..."
										emptyText="No warehouse found."
									/>
								)}
							/>
							<FieldError>{errors.products?.[index]?.warehouseCen?.message}</FieldError>
						</Field>
						<Field>
							<FieldLabel htmlFor={`products.${index}.quantity`}>Quantity</FieldLabel>
							<Input
								id={`products.${index}.quantity`}
								placeholder="1"
								type="number"
								{...register(`products.${index}.quantity`)}
								min={1}
								max={10000}
							/>
							<FieldError>{errors.products?.[index]?.quantity?.message}</FieldError>
						</Field>
						<Button
							type="button"
							variant="destructive"
							className={`${errors.products?.[index] === undefined ? "self-end" : ""} cursor-pointer`}
							onClick={() => {
								remove(index);
								void trigger("products");
							}}
						>
							Remove
						</Button>
					</div>
				))}

				<FieldError>{errors.products?.root?.message}</FieldError>
				<Button
					type="button"
					variant="contrast"
					className="w-1/3 cursor-pointer opacity-80"
					onClick={() => {
						append({ productCen: "", warehouseCen: "", quantity: "" });
					}}
				>
					+ Agregar movimiento
				</Button>

				<Button type="submit" className="cursor-pointer w-1/3">
					Submit
				</Button>
			</form>
		</div>
	);
}
