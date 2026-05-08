import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSelectedCompanyId } from "@/store/companyStore";
import { Title } from "@/ui/typography";
import TaxSettingsForm from "../../components/TaxSettingsForm";
import { useTax } from "../../hooks/use-tax";
import { useUpdateTax } from "../../hooks/use-update-tax";
import { parseTaxPercentage } from "../../utils/saleUtils";

export default function TaxPage() {
	const selectedCompanyId = useSelectedCompanyId();
	const companyId = Number.parseInt(selectedCompanyId ?? "", 10);
	const hasValidCompany = Number.isInteger(companyId) && companyId > 0;

	const [taxPercentageInput, setTaxPercentageInput] = useState<string>("");

	const taxQuery = useTax(hasValidCompany ? companyId : null);
	const updateTaxMutation = useUpdateTax();

	useEffect(() => {
		if (taxQuery.data === undefined) {
			return;
		}

		setTaxPercentageInput(String(taxQuery.data));
	}, [taxQuery.data]);

	const handleUpdateTax = async () => {
		if (!hasValidCompany) {
			toast.error("Selecciona una compania antes de actualizar el impuesto.");
			return;
		}

		const parsedTax = parseTaxPercentage(taxPercentageInput);
		if (!Number.isFinite(parsedTax) || parsedTax <= 0 || parsedTax > 100) {
			toast.error("El impuesto debe ser un numero decimal positivo mayor a 0 y menor a 100.");
			return;
		}

		await updateTaxMutation.mutateAsync({
			companyId,
			globalTaxPercentage: parsedTax,
		});

		toast.success("Impuesto global actualizado correctamente.");
		await taxQuery.refetch();
	};

	return (
		<div className="flex flex-col w-full h-full gap-4">
			<Title as="h1">Impuesto Global</Title>

			{!hasValidCompany ? (
				<p className="text-sm text-muted-foreground">
					Selecciona una compania para consultar y actualizar su impuesto global.
				</p>
			) : null}

			<TaxSettingsForm
				taxPercentageInput={taxPercentageInput}
				onTaxPercentageChange={setTaxPercentageInput}
				onSubmit={() => {
					void handleUpdateTax();
				}}
				isLoadingTax={taxQuery.isLoading}
				isSavingTax={updateTaxMutation.isPending}
				isDisabled={!hasValidCompany}
				hasFetchError={taxQuery.isError}
			/>
		</div>
	);
}
