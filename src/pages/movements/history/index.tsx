import { useEffect, useState } from "react";
import movementService from "@/api/services/movementService";
import { DataTable } from "@/components/data-table";
import { useSelectedCompanyId } from "@/store/companyStore";
import type { Movement } from "@/types/movement";
import { Title } from "@/ui/typography";
import { columns } from "./columns";

export default function MovementsHistoryPage() {
	const companyId = useSelectedCompanyId() || "-1";

	const [historyMovements, setHistoryMovements] = useState<Movement[]>([]);

	useEffect(() => {
		const fetchHistoryMovements = async () => {
			try {
				const response = await movementService.getMovements(companyId);
				setHistoryMovements(response.data);
			} catch (error) {
				console.error(error);
			}
		};

		fetchHistoryMovements();
	}, [companyId]);

	return (
		<div className="flex flex-col w-full h-full gap-4">
			<Title as="h1">Historial de Movimientos</Title>

			<DataTable columns={columns} data={historyMovements} />
		</div>
	);
}
