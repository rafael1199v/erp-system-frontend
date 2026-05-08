import { useCallback, useEffect } from "react";
import { useSelectedCompanyId } from "@/store/companyStore";
import { useRouter } from "../hooks";

type Props = {
	children: React.ReactNode;
};
export default function CompanyAuthGuard({ children }: Props) {
	const router = useRouter();
	const companyId = useSelectedCompanyId();

	const check = useCallback(() => {
		if (!companyId) {
			router.replace("/company");
		}
	}, [router, companyId]);

	useEffect(() => {
		check();
	}, [check]);

	return <>{children}</>;
}
