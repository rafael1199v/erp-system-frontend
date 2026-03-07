import { Transaction, TransactionDetails } from "@/types/transaction";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { Title } from "@/ui/typography";
import { DataTable } from "@/components/data-table";
import { getColumns } from "./columns";
import transactionService from "@/api/services/transactionService";

export default function TransactionDetailsPage () {
    const { productId } = useParams();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [productName, setProductName] = useState<string>("Anonymous");
    
    const fetchTransactionDetails = async (): Promise<void> => {
        const response = await transactionService.getTransactionDetails(productId || "-1");
        const transactionDetail: TransactionDetails = response.data;
        
        transactionDetail.transactions.sort((a, b) => {
            const firstDateTime = new Date(a.transactionDate).getTime();
            const secondDateTime = new Date(b.transactionDate).getTime();

            if(firstDateTime === secondDateTime) {
                return b.id - a.id;
            }

            return secondDateTime - firstDateTime;
        });
        
        setTransactions(transactionDetail.transactions);
        setProductName(transactionDetail.productName);
    };

    useEffect(() => {
        fetchTransactionDetails();
    }, []);


    return (
         <div className="flex flex-col w-full h-full gap-4">
            <Title as="h1">
                Product: {productName}
            </Title>

            <div className="h-full w-11/12">
                <DataTable 
                    columns={getColumns()}
                    data={transactions}
                />
            </div>
        </div>
    )
}
