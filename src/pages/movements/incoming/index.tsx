import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import movementService from "@/api/services/movementService";
import { DataTable } from "@/components/data-table";
import { useSelectedCompanyCen } from "@/store/companyStore";
import type { Movement } from "@/types/movement";
import { Button } from "@/ui/button";
import { Title } from "@/ui/typography";
import { columns } from "./columns";

export default function IncomingMovementsPage() {
	const companyCen = useSelectedCompanyCen() || "";

	const [incomingMovements, setIncomingMovements] = useState<Movement[]>([]);
	const nav = useNavigate();

	useEffect(() => {
		const fetchIncomingMovements = async () => {
			if (!companyCen) {
				setIncomingMovements([]);
				return;
			}

			try {
				const response = await movementService.getMovementsByType("ENTRY", companyCen);
				setIncomingMovements(response.data);
			} catch (error) {
				console.error(error);
			}
		};

		fetchIncomingMovements();
	}, [companyCen]);

	return (
		<div className="flex flex-col w-full h-full gap-4">
			<Title as="h1">Movimientos de Entrada</Title>

			<Button
				variant="default"
				className="cursor-pointer"
				onClick={() => {
					nav("/movements/incoming/form");
				}}
			>
				Crear entrada
			</Button>

			<div className="h-full w-11/12">
				<DataTable columns={columns} data={incomingMovements} />
			</div>
		</div>
	);
}
