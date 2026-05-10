import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CircleAlert, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Combobox, type ComboboxOption } from "@/components/combobox";
import { useSelectedCompanyCen } from "@/store/companyStore";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Field, FieldError, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Title } from "@/ui/typography";
import { usePurchaseProducts, usePurchaseSuppliers, usePurchaseWarehouses } from "../../hooks/use-purchase-lookups";
import { useCreatePurchaseOrder } from "../../hooks/use-purchase-orders";

const purchaseOrderSchema = z
	.object({
		supplierCen: z.string().min(1, "Selecciona un proveedor"),
		warehouseCen: z.string().min(1, "Selecciona un almacen"),
		items: z
			.array(
				z.object({
					productCen: z.string().min(1, "Selecciona un producto"),
					quantity: z.coerce
						.number({ invalid_type_error: "La cantidad debe ser un numero" })
						.int("La cantidad debe ser un numero entero")
						.positive("La cantidad debe ser mayor a cero"),
				}),
			)
			.min(1, "Agrega por lo menos un producto"),
	})
	.superRefine((values, context) => {
		const productCens = new Set<string>();

		values.items.forEach((item, index) => {
			if (!item.productCen) return;

			if (productCens.has(item.productCen)) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Este producto ya fue agregado",
					path: ["items", index, "productCen"],
				});
			}

			productCens.add(item.productCen);
		});
	});

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

const defaultValues: PurchaseOrderFormValues = {
	supplierCen: "",
	warehouseCen: "",
	items: [{ productCen: "", quantity: 1 }],
};

const toOptions = <T extends { name: string }>(items: T[], getValue: (item: T) => string): ComboboxOption[] => {
	return items.map((item) => ({ value: getValue(item), label: item.name }));
};

export default function PurchaseOrderCreatePage() {
	const navigate = useNavigate();
	const selectedCompanyCen = useSelectedCompanyCen();
	const companyCen = selectedCompanyCen ?? "";
	const hasValidCompany = companyCen.trim() !== "";
	const suppliersQuery = usePurchaseSuppliers(hasValidCompany ? companyCen : null);
	const warehousesQuery = usePurchaseWarehouses(hasValidCompany ? companyCen : null);
	const productsQuery = usePurchaseProducts(hasValidCompany ? companyCen : null);
	const createPurchaseOrder = useCreatePurchaseOrder();

	const supplierOptions = useMemo(
		() => toOptions(suppliersQuery.data ?? [], (supplier) => supplier.supplierCen),
		[suppliersQuery.data],
	);
	const warehouseOptions = useMemo(
		() =>
			toOptions(
				(warehousesQuery.data ?? []).filter((warehouse) => warehouse.isActive),
				(warehouse) => warehouse.warehouseCen,
			),
		[warehousesQuery.data],
	);
	const productOptions = useMemo(() => {
		return (productsQuery.data ?? []).map((product) => ({
			value: product.productCen,
			label: `${product.name} (${product.sku})`,
		}));
	}, [productsQuery.data]);

	const {
		control,
		handleSubmit,
		register,
		formState: { errors },
	} = useForm<PurchaseOrderFormValues>({
		resolver: zodResolver(purchaseOrderSchema),
		defaultValues,
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "items",
	});

	const onSubmit = async (values: PurchaseOrderFormValues) => {
		if (!hasValidCompany) {
			toast.error("Selecciona una compania antes de crear una orden.");
			return;
		}

		const createdOrder = await createPurchaseOrder.mutateAsync({
			companyCen,
			payload: {
				supplierCen: values.supplierCen,
				warehouseCen: values.warehouseCen,
				items: values.items.map((item) => ({
					productCen: item.productCen,
					quantity: item.quantity,
				})),
			},
		});

		toast.success("Orden de compra creada correctamente.");
		navigate(`/purchases/orders/${encodeURIComponent(createdOrder.orderCen)}`);
	};

	return (
		<div className="flex h-full w-full flex-col gap-5 pb-6">
			<div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Badge variant="info">Compras</Badge>
						<Badge variant="outline">Nueva orden</Badge>
					</div>
					<Title as="h1">Nueva orden de compra</Title>
					<p className="max-w-2xl text-sm text-muted-foreground">
						Selecciona proveedor, almacen y productos. La orden enviara solo CENs y cantidades.
					</p>
				</div>

				<Button variant="outline" onClick={() => navigate("/purchases/orders")}>
					<ArrowLeft className="size-4" />
					Volver
				</Button>
			</div>

			{!hasValidCompany ? (
				<Alert>
					<CircleAlert className="size-4" />
					<AlertTitle>Compania requerida</AlertTitle>
					<AlertDescription>Selecciona una compania para crear una orden de compra.</AlertDescription>
				</Alert>
			) : null}

			<Card>
				<CardHeader>
					<CardTitle>Datos de la orden</CardTitle>
					<CardDescription>Los nombres se usan solo para mostrar informacion en pantalla.</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						<div className="grid gap-4 lg:grid-cols-2">
							<Field>
								<FieldLabel>Proveedor</FieldLabel>
								<Controller
									name="supplierCen"
									control={control}
									render={({ field }) => (
										<Combobox
											options={supplierOptions}
											value={field.value}
											onChange={field.onChange}
											placeholder="Selecciona un proveedor"
											searchPlaceholder="Buscar proveedor..."
											emptyText="No se encontraron proveedores."
											disabled={!hasValidCompany || suppliersQuery.isLoading}
										/>
									)}
								/>
								<FieldError>{errors.supplierCen?.message}</FieldError>
							</Field>

							<Field>
								<FieldLabel>Almacen</FieldLabel>
								<Controller
									name="warehouseCen"
									control={control}
									render={({ field }) => (
										<Combobox
											options={warehouseOptions}
											value={field.value}
											onChange={field.onChange}
											placeholder="Selecciona un almacen"
											searchPlaceholder="Buscar almacen..."
											emptyText="No se encontraron almacenes activos."
											disabled={!hasValidCompany || warehousesQuery.isLoading}
										/>
									)}
								/>
								<FieldError>{errors.warehouseCen?.message}</FieldError>
							</Field>
						</div>

						<div className="space-y-4">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<h2 className="text-base font-semibold">Productos</h2>
									<p className="text-sm text-muted-foreground">Agrega cada producto una sola vez.</p>
								</div>
								<Button type="button" variant="outline" onClick={() => append({ productCen: "", quantity: 1 })}>
									<Plus className="size-4" />
									Agregar producto
								</Button>
							</div>

							<div className="space-y-3">
								{fields.map((field, index) => (
									<div className="grid gap-3 rounded-xl border bg-muted/10 p-4 lg:grid-cols-[1fr_160px_auto]" key={field.id}>
										<Field>
											<FieldLabel>Producto</FieldLabel>
											<Controller
												name={`items.${index}.productCen`}
												control={control}
												render={({ field: productField }) => (
													<Combobox
														options={productOptions}
														value={productField.value}
														onChange={productField.onChange}
														placeholder="Selecciona un producto"
														searchPlaceholder="Buscar producto..."
														emptyText="No se encontraron productos."
														disabled={!hasValidCompany || productsQuery.isLoading}
													/>
												)}
											/>
											<FieldError>{errors.items?.[index]?.productCen?.message}</FieldError>
										</Field>

										<Field>
											<FieldLabel>Cantidad</FieldLabel>
											<Input
												type="number"
												min={1}
												step={1}
												placeholder="1"
												{...register(`items.${index}.quantity`)}
											/>
											<FieldError>{errors.items?.[index]?.quantity?.message}</FieldError>
										</Field>

										<Button
											type="button"
											variant="destructive"
											className="self-end"
											onClick={() => remove(index)}
											disabled={fields.length === 1}
										>
											<Trash2 className="size-4" />
											Quitar
										</Button>
									</div>
								))}
							</div>
							<FieldError>{errors.items?.root?.message}</FieldError>
						</div>

						<div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-end">
							<Button type="button" variant="outline" onClick={() => navigate("/purchases/orders")}>
								Cancelar
							</Button>
							<Button type="submit" disabled={!hasValidCompany || createPurchaseOrder.isPending}>
								{createPurchaseOrder.isPending ? "Creando..." : "Crear orden"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
