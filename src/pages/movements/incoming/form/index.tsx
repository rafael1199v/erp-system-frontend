import { Combobox, ComboboxOption } from "@/components/combobox";
import { Button } from "@/ui/button";
import { Field, FieldError, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Title } from "@/ui/typography";
import { useSelectedCompanyId } from "@/store/companyStore";
import warehouseService from "@/api/services/warehouseService";
import productService from "@/api/services/productService";
import { useEffect, useState } from "react";
import { CreateMovement } from "@/types/movement";
import { MovementStatus, MovementType, TransactionType } from "@/types/enum";
import movementService from "@/api/services/movementService";
import { useNavigate } from "react-router";


const movementSchema = z.object({
  reason: z.string().nonempty("El motivo es requerido"),
  products: z.array(
    z.object({
      productId: z.string().min(1, "Seleccione un producto"),
      warehouseId: z.string().min(1, "Seleccione un almacén"),
      quantity: z.string().min(1, "La cantidad debe ser positiva")
    })
  ).min(1, "Agrega por lo menos un producto para registrar una entrada")
});


export default function MovementForm() {
  const companyId: string = useSelectedCompanyId() || "-1";
  
  const [productOptions, setProductOptions] = useState<ComboboxOption[]>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<ComboboxOption[]>([]);
  const nav = useNavigate();

  const { control, handleSubmit, register, formState: { errors }, trigger } = useForm<z.infer<typeof movementSchema>>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      reason: "",
      products: [{
        productId: "",
        warehouseId: "",
        quantity: ""
      }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products"
  });


  const fetchWarehouses = async () => {
    try {
      const response = await warehouseService.getWarehousesByCompany(companyId);

      const warehouseOptionsResponse = response.data.map(warehouse => {
        return {
          value: warehouse.id.toString(),
          label: warehouse.name
        }
      })

      setWarehouseOptions(warehouseOptionsResponse);
      console.log(response.data);
    }
    catch(error) {
      console.error(error);
    }

  }

  const fetchProducts = async () => {
    try {
      const response = await productService.getProductCatalog(companyId);
      const productOptionsResponse = response.data.map(product => {
        return {
          value: product.productId.toString(),
          label: product.productName
        }
      });

      setProductOptions(productOptionsResponse);

      console.log(response.data);
    }
    catch(error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchProducts();
    fetchWarehouses();
  }, []);

  const onSubmit = async (values: z.infer<typeof movementSchema>) => {
    trigger("products")

    const movement: CreateMovement = {
      title: values.reason,
      movementType: MovementType.RECEIPT,
      movementDate: new Date().toISOString().split('T')[0],
      movementStatus: MovementStatus.DRAW,
      companyId: parseInt(companyId),
      transactions: values.products.map(transaction => {
        return {
          quantity: parseInt(transaction.quantity),
          reason: values.reason,
          transactionDate: new Date().toISOString().split('T')[0],
          transactionType: TransactionType.IN,
          productId: parseInt(transaction.productId),
          warehouseId: parseInt(transaction.warehouseId)
        }
      })
    }

    try {
      await movementService.createMovement(movement);
      toast.success("Movimiento creado con exito");
      // toast(
      //   <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
      //     <code className="text-white">{JSON.stringify(movement, null, 2)}</code>
      //   </pre>,
      // );
      nav("/movements/incoming");
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full h-full">
      <Title as="h1">
        Movimientos de Entrada
      </Title>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4 justify-content items-start">
        <Field className="w-1/2">
          <FieldLabel htmlFor="reason">Motivo</FieldLabel>
          <Input
            id="reason"
            placeholder="Motivo de la entrada"
            type="text"
            {...register("reason")}
          />
          <FieldError>
            {errors.reason?.message}
          </FieldError>
        </Field>

        {fields.map((field, index) => (
          <div className="w-full flex flex-row gap-4 pe-8 pb-8 pt-4 items-center justify-content" key={field.id}>
            <Field>
              <FieldLabel htmlFor={`products.${index}.productId`}>Product</FieldLabel>
              <Controller
                name={`products.${index}.productId`}
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
              <FieldError>{errors.products?.[index]?.productId?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor={`products.${index}.warehouseId`}>Warehouse</FieldLabel>
              <Controller
                name={`products.${index}.warehouseId`}
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
              <FieldError>
                {errors.products?.[index]?.warehouseId?.message}
              </FieldError>
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
              <FieldError>
                {errors.products?.[index]?.quantity?.message}
              </FieldError>
            </Field>
            <Button
              type="button"
              variant="destructive"
              className={`${errors.products?.[index] === undefined ? 'self-end' : ''} cursor-pointer`}
              onClick={() => {
                remove(index);
                trigger("products");
              }}>
              Remove
            </Button>
          </div>
        ))}

        <FieldError>
          {errors.products?.root?.message}
        </FieldError>
         <Button type="button" variant="contrast" className="w-1/3 cursor-pointer opacity-80"
            onClick={() => {
              append({
                productId: "",
                warehouseId: "",
                quantity: ""
              })
            }}>
            + Agregar movimiento
          </Button>


        <Button type="submit" className="cursor-pointer w-1/3">Submit</Button>
      </form>

    </div>
  );

}