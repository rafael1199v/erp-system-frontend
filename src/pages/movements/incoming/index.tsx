import { DataTable } from "@/components/data-table";
import { MovementType } from "@/types/enum";
import { Movement } from "@/types/movement";
import { Title } from "@/ui/typography";
import { columns } from "./columns";
import { useEffect, useState } from "react";
import movementService from "@/api/services/movementService";
import { Button } from "@/ui/button";
import { useNavigate } from "react-router";
import { useSelectedCompanyId } from "@/store/companyStore";

export default function IncomingMovementsPage() {

    const companyId = useSelectedCompanyId() || "-1";

    const [incomingMovements, setIncomingMovements] =  useState<Movement[]>([]);
    const nav = useNavigate();

    const fetchIncomingMovements = async () => {
        try {
            const response = await movementService.getMovementsByType(MovementType.RECEIPT, companyId);
            setIncomingMovements(response.data);
        }
        catch(error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchIncomingMovements();
    },[]);

    return (
        <div className="flex flex-col w-full h-full gap-4">
            <Title as="h1">
                Movimientos de Entrada
            </Title>

            <Button variant="default" className="cursor-pointer" onClick={() => {
                nav("/movements/incoming/form")
            }}>
                Crear entrada
            </Button>

                <div className="h-full w-11/12">
                    <DataTable
                        columns={columns}
                        data={incomingMovements}
                    />
                </div>
        </div>
    );
}