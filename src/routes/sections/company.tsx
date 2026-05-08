import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router";
import { Outlet } from "react-router";
import { LineLoading } from "@/components/loading";

const CompanyPage = lazy(() => import("@/pages/company"));
const companyCustom: RouteObject[] = [
	{
		index: true,
		element: <CompanyPage />,
	},
];

export const companyRoutes: RouteObject[] = [
	{
		path: "/company",
		element: (
			<Suspense fallback={<LineLoading />}>
				<Outlet />
			</Suspense>
		),
		children: [...companyCustom],
	},
];
