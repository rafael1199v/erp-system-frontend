import { useEffect, useState } from "react";
import { useParams } from "react-router";
import transactionService from "@/api/services/transactionService";
import { DataTable } from "@/components/data-table";
import { useSelectedCompanyCen } from "@/store/companyStore";
import type { Transaction } from "@/types/transaction";
import { Title } from "@/ui/typography";
import { getColumns } from "./columns";

export default function TransactionDetailsPage() {
	const { productId } = useParams();
	const companyCen = useSelectedCompanyCen();
	const productCen = productId ? decodeURIComponent(productId) : "";
	const [transactions, setTransactions] = useState<Transaction[]>([]);

	useEffect(() => {
		const fetchTransactionDetails = async (): Promise<void> => {
			if (!companyCen || !productCen) {
				setTransactions([]);
				return;
			}

			const response = await transactionService.getTransactionDetails(companyCen, productCen);
			const transactionDetails = response.data;

			transactionDetails.sort((first, second) => {
				const firstDateTime = new Date(first.createdAt).getTime();
				const secondDateTime = new Date(second.createdAt).getTime();

				if (firstDateTime === secondDateTime) {
					return second.movementCen.localeCompare(first.movementCen);
				}

				return secondDateTime - firstDateTime;
			});

			setTransactions(transactionDetails);
		};

		void fetchTransactionDetails();
	}, [companyCen, productCen]);

	return (
		<div className="flex flex-col w-full h-full gap-4">
			<Title as="h1">Producto: {productCen || "Sin datos"}</Title>

			<div className="h-full w-11/12">
				<DataTable columns={getColumns()} data={transactions} />
			</div>
		</div>
	);
}
