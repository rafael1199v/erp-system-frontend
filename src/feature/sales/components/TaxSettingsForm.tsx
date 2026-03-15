import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { parseTaxPercentage } from "../utils/saleUtils";

type TaxSettingsFormProps = {
	taxPercentageInput: string;
	onTaxPercentageChange: (value: string) => void;
	onSubmit: () => void;
	isLoadingTax: boolean;
	isSavingTax: boolean;
	isDisabled: boolean;
	hasFetchError: boolean;
};

export default function TaxSettingsForm({
	taxPercentageInput,
	onTaxPercentageChange,
	onSubmit,
	isLoadingTax,
	isSavingTax,
	isDisabled,
	hasFetchError,
}: TaxSettingsFormProps) {
	const parsedTax = parseTaxPercentage(taxPercentageInput);
	const isPositiveDecimal = Number.isFinite(parsedTax) && parsedTax > 0 && parsedTax <= 100;
	const canSubmit =
		!isDisabled && !isLoadingTax && !isSavingTax && taxPercentageInput.trim().length > 0 && isPositiveDecimal;

	return (
		<Card className="w-full max-w-xl">
			<CardHeader>
				<CardTitle>Configuracion de impuesto</CardTitle>
				<CardDescription>
					Actualiza el porcentaje de impuesto global usado en tus futuras ventas. 
				</CardDescription>
			</CardHeader>

			<CardContent className="grid gap-2">
				<Label htmlFor="global-tax-percentage">Porcentaje de impuesto (%)</Label>
				<Input
					id="global-tax-percentage"
					type="number"
					step="0.01"
					min="0.01"
					placeholder="Ej: 10"
					value={taxPercentageInput}
					disabled={isDisabled || isLoadingTax || isSavingTax}
					onChange={(event) => onTaxPercentageChange(event.target.value)}
				/>
				{hasFetchError ? (
					<p className="text-sm text-error-dark">No se pudo obtener el impuesto global actual.</p>
				) : null}
				{!hasFetchError && taxPercentageInput.trim().length > 0 && !isPositiveDecimal ? (
					<p className="text-sm text-error-dark">Ingresa un valor decimal positivo mayor a 0 y menor o igual a 100.</p>
				) : null}
			</CardContent>

			<CardFooter className="justify-end">
				<Button type="button" onClick={onSubmit} disabled={!canSubmit}>
					{isSavingTax ? "Guardando..." : "Guardar impuesto"}
				</Button>
			</CardFooter>
		</Card>
	);
}
