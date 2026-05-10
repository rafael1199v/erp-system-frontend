import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/ui/button";

type PurchasePaginationProps = {
	currentPage: number;
	totalPages: number;
	totalCount: number;
	isFetching?: boolean;
	onPageChange: (page: number) => void;
};

export default function PurchasePagination({
	currentPage,
	totalPages,
	totalCount,
	isFetching = false,
	onPageChange,
}: PurchasePaginationProps) {
	const safeTotalPages = Math.max(totalPages, 1);

	return (
		<div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
			<p className="text-sm text-muted-foreground">
				{totalCount} ordenes encontradas. Pagina {currentPage} de {safeTotalPages}.
			</p>
			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage <= 1 || isFetching}
				>
					<ChevronLeft className="size-4" />
					Anterior
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage >= safeTotalPages || isFetching}
				>
					Siguiente
					<ChevronRight className="size-4" />
				</Button>
			</div>
		</div>
	);
}
