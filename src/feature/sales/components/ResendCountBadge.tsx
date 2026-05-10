import { Badge } from "@/ui/badge";

type ResendCountBadgeProps = {
	resendCount: number;
	className?: string;
};

export default function ResendCountBadge({ resendCount, className }: ResendCountBadgeProps) {
	const normalizedResendCount = Number.isFinite(resendCount) ? resendCount : 0;

	if (normalizedResendCount <= 0) {
		return null;
	}

	return (
		<Badge variant="warning" className={className}>
			Reenvios: {normalizedResendCount}
		</Badge>
	);
}
