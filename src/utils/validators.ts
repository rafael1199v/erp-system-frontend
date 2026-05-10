import type { UpdateStockForm, UpdateStockFormErrors } from "@/types/forms/update-stock-form";

export const UpdateStockFormValidator = {
	validateForm(form: UpdateStockForm): UpdateStockFormErrors {
		const errors: UpdateStockFormErrors = {
			stockError: null,
			reasonError: null,
		};

		if (Number.isNaN(form.stock)) {
			errors.stockError = "La cantidad no es valida";
		}

		if (form.reason === null || form.reason.trim().length === 0) {
			errors.reasonError = "El motivo es requerido";
		}

		return errors;
	},
};
