import { useState } from "react";
import { toast } from "sonner";
import movementService from "@/api/services/movementService";
import { useSelectedCompanyId } from "@/store/companyStore";
import { MovementStatus, MovementType, TransactionType } from "@/types/enum";
import type { UpdateStockForm, UpdateStockFormErrors } from "@/types/forms/update-stock-form";
import type { CreateMovement } from "@/types/movement";
import { Button } from "@/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/ui/field";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { UpdateStockFormValidator } from "@/utils/validators";
import type { ProductWithWarehouseTableRow } from "../columns";

interface ChangeStockDialogProps {
	productWithWarehouse: ProductWithWarehouseTableRow;
	onStockUpdated: () => Promise<void>;
}

export default function ChangeStockDialog({ productWithWarehouse, onStockUpdated }: ChangeStockDialogProps) {
	const [open, setOpen] = useState<boolean>(false);
	const companyId = useSelectedCompanyId() || "-1";

	const [updateStockForm, setUpdateStockForm] = useState<UpdateStockForm>({
		stock: productWithWarehouse.stock,
		reason: "",
	});

	const [updateStockFormErrors, setUpdateStockFormErrors] = useState<UpdateStockFormErrors>({
		stockError: null,
		reasonError: null,
	});

	const onChangeStock = (value: number) => {
		if (Number.isNaN(value)) value = 0;

		if (value < 0 || value > 100000) return;

		setUpdateStockForm({ ...updateStockForm, stock: value });
	};

	const onChangeReason = (value: string) => {
		if (value.length >= 100) return;

		setUpdateStockForm({ ...updateStockForm, reason: value });
	};

	const onSubmit = async () => {
		const errors: UpdateStockFormErrors = UpdateStockFormValidator.validateForm(updateStockForm);
		const hasNoErrors: boolean = Object.keys(errors).every((key) => errors[key as keyof typeof errors] === null);

		if (hasNoErrors) {
			console.log("Submit form", updateStockForm);

			const movement: CreateMovement = {
				title: `Adjustment for '${productWithWarehouse.productName}'`,
				movementDate: new Date().toISOString().split("T")[0],
				movementStatus: MovementStatus.DRAW,
				movementType: MovementType.ADJUSTMENT,
				companyId: parseInt(companyId),
				transactions: [
					{
						quantity: updateStockForm.stock - productWithWarehouse.stock,
						reason: updateStockForm.reason,
						transactionDate: new Date().toISOString().split("T")[0],
						transactionType: TransactionType.ADJUSTMENT,
						productId: productWithWarehouse.productId,
						warehouseId: productWithWarehouse.warehouseId,
					},
				],
			};

			try {
				await movementService.createAdjustment(movement);
				await onStockUpdated();
				toast.success("Ajuste completado correctamente");
			} catch (err) {
				console.error(err);
				toast.error("Hubo un error al ajustar el stock, inténtalo nuevamente");
			} finally {
				setOpen(false);
			}
		} else {
			setUpdateStockFormErrors(errors);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<form>
				<DialogTrigger asChild>
					<Button variant="outline" className="cursor-pointer">
						Editar stock
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle>Editar stock</DialogTitle>
						<DialogDescription>
							Realiza cambios en el stock. <br />
							Cualquier cambio se registrará como un nuevo movimiento para facilitar el seguimiento del producto.
						</DialogDescription>
					</DialogHeader>
					<FieldGroup>
						<Field>
							<Label htmlFor="product-quantity">Stock</Label>
							<Input
								id="product-quantity"
								name="stock"
								type="number"
								value={updateStockForm.stock}
								onChange={(e) => onChangeStock(parseInt(e.target.value))}
								min={0}
								max={10000}
							/>

							{updateStockFormErrors.stockError && <FieldError>{updateStockFormErrors.stockError}</FieldError>}
						</Field>
						<Field>
							<Label htmlFor="reason-1">Motivo</Label>
							<Input
								id="reason-1"
								name="reason"
								placeholder="Motivo del cambio"
								value={updateStockForm.reason}
								onChange={(e) => onChangeReason(e.target.value)}
							/>

							{updateStockFormErrors.reasonError && <FieldError>{updateStockFormErrors.reasonError}</FieldError>}
						</Field>
					</FieldGroup>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">Cancelar</Button>
						</DialogClose>
						<Button type="submit" onClick={onSubmit}>
							Actualizar
						</Button>
					</DialogFooter>
				</DialogContent>
			</form>
		</Dialog>
	);
}
