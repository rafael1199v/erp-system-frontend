import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { GLOBAL_CONFIG } from "@/global-config";
import { useSelectedCompanyCen } from "@/store/companyStore";
import type { RestockEvent } from "@/types/restock";

export function useRestockNotifications() {
	const companyCen = useSelectedCompanyCen();
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!companyCen) return;

		const url = `${GLOBAL_CONFIG.apiBaseUrl}/inventory/companies/${encodeURIComponent(companyCen)}/restock-events`;
		const source = new EventSource(url);

		source.onmessage = (event) => {
			let restock: RestockEvent;
			try {
				restock = JSON.parse(event.data);
			} catch {
				return;
			}

			const summary = restock.items.map((item) => `${item.productCen} +${item.quantity}`).join(", ");
			toast.info(`Restock recibido (${restock.referenceCen}): ${summary}`, { position: "top-right" });

			queryClient.invalidateQueries({ queryKey: ["product-catalog", companyCen] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-inventory-summary", companyCen] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-low-stock", companyCen] });
		};

		source.onerror = () => {};

		return () => source.close();
	}, [companyCen, queryClient]);
}
