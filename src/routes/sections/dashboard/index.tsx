import { Navigate, type RouteObject } from "react-router";
import { GLOBAL_CONFIG } from "@/global-config";
import DashboardLayout from "@/layouts/dashboard";
import CompanyAuthGuard from "@/routes/components/company-guard";
import { getBackendDashboardRoutes } from "./backend";
import { getFrontendDashboardRoutes } from "./frontend";

const getRoutes = (): RouteObject[] => {
	if (GLOBAL_CONFIG.routerMode === "frontend") {
		return getFrontendDashboardRoutes();
	}
	return getBackendDashboardRoutes();
};

export const dashboardRoutes: RouteObject[] = [
	{
		element: (
			//<LoginAuthGuard>
			<CompanyAuthGuard>
				<DashboardLayout />
			</CompanyAuthGuard>
			//</LoginAuthGuard>
		),
		children: [{ index: true, element: <Navigate to={GLOBAL_CONFIG.defaultRoute} replace /> }, ...getRoutes()],
	},
];
