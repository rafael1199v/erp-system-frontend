import { Title } from "@/ui/typography";
import { columns } from "./columns";
import { Movement } from "@/types/movement";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import movementService from "@/api/services/movementService";
import { useSelectedCompanyId } from "@/store/companyStore";

export default function MovementsHistoryPage () {
    const companyId = useSelectedCompanyId() || "-1";

    const [historyMovements, setHistoryMovements] = useState<Movement[]>([]);

    const fetchHistoryMovements = async () => {

        try {
            const response = await movementService.getMovements(companyId);
            setHistoryMovements(response.data)
        }
        catch(error) {
            console.error(error);
        } 
        
    }

    useEffect(() => {
        fetchHistoryMovements();
    },[]);

    return (
        <div className="flex flex-col w-full h-full gap-4">
            <Title as="h1">
                Historial de Movimientos
            </Title>

            <DataTable 
                columns={columns}
                data={historyMovements}
            />
        </div>
    )

}