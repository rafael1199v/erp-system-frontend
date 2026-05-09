import { useCallback, useEffect } from "react";
import { useSelectedCompanyCen } from "@/store/companyStore";
import { useRouter } from "../hooks";

type Props = {
	children: React.ReactNode;
};
export default function CompanyAuthGuard({ children }: Props) {
	const router = useRouter();
	const companyCen = useSelectedCompanyCen();

	const check = useCallback(() => {
		if (!companyCen) {
			router.replace("/company");
		}
	}, [router, companyCen]);

	useEffect(() => {
		check();
	}, [check]);

	return <>{children}</>;
}
