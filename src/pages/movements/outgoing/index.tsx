import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import movementService from "@/api/services/movementService";
import { DataTable } from "@/components/data-table";
import { useSelectedCompanyCen } from "@/store/companyStore";
import type { Movement } from "@/types/movement";
import { Button } from "@/ui/button";
import { Title } from "@/ui/typography";
import { columns } from "./columns";

export default function MovementsOutgoingPage() {
	const companyCen = useSelectedCompanyCen() || "";

	const [outgointMovements, setOutgoingMovements] = useState<Movement[]>([]);
	const nav = useNavigate();

	useEffect(() => {
		const fetchOutgoingMovements = async () => {
			if (!companyCen) {
				setOutgoingMovements([]);
				return;
			}

			try {
				const response = await movementService.getMovementsByType("EXIT", companyCen);
				setOutgoingMovements(response.data);
			} catch (error) {
				console.error(error);
			}
		};

		fetchOutgoingMovements();
	}, [companyCen]);

	return (
		<div className="flex flex-col w-full h-full gap-4">
			<Title as="h1">Movimientos de Salida</Title>

			<Button
				variant="default"
				className="cursor-pointer"
				onClick={() => {
					nav("/movements/outgoing/form");
				}}
			>
				Registrar salida
			</Button>

			<DataTable columns={columns} data={outgointMovements} />
		</div>
	);
}
