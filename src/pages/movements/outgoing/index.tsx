import { Title } from "@/ui/typography";
import { MovementType } from "@/types/enum";
import { Movement } from "@/types/movement";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import movementService from "@/api/services/movementService";
import { useEffect, useState } from "react";
import { useSelectedCompanyId } from "@/store/companyStore";
import { Button } from "@/ui/button";
import { useNavigate } from "react-router";

export default function MovementsOutgoingPage () {
    const companyId = useSelectedCompanyId() || "-1";

    const [outgointMovements, setOutgoingMovements] = useState<Movement[]>([]);
    const nav = useNavigate();

    const fetchOutgoingMovements = async () => {
        try {
            const response = await movementService.getMovementsByType(MovementType.ISSUE, companyId);
            setOutgoingMovements(response.data);
        }
        catch(error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchOutgoingMovements();        
    },[])

    return (
        <div className="flex flex-col w-full h-full gap-4">
            <Title as="h1">
                Movimientos de Salida
            </Title>

            <Button
                variant="default" 
                className="cursor-pointer"
                onClick={() => {
                    nav("/movements/outgoing/form")
                }}
            >
                Registrar salida
            </Button>

            <DataTable
                columns={columns}
                data={outgointMovements}
            />
        </div>
    );
}