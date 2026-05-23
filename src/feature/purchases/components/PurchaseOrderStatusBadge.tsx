import { Badge } from "@/ui/badge";
import { getPurchaseOrderStatusBadgeVariant, getPurchaseOrderStatusLabel } from "../utils/purchase-order";

type PurchaseOrderStatusBadgeProps = {
	status: string | null | undefined;
};

export default function PurchaseOrderStatusBadge({ status }: PurchaseOrderStatusBadgeProps) {
	return <Badge variant={getPurchaseOrderStatusBadgeVariant(status)}>{getPurchaseOrderStatusLabel(status)}</Badge>;
}
