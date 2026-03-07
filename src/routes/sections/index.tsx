import { Navigate, type RouteObject } from "react-router";
import { authRoutes } from "./auth";
import { companyRoutes } from "./company";
import { dashboardRoutes } from "./dashboard";
import { mainRoutes } from "./main";

export const routesSection: RouteObject[] = [
	// Auth
	//...authRoutes,
	// Dashboard
	...dashboardRoutes,
	// Main
	...mainRoutes,
	...companyRoutes,
	// No Match
	{ path: "*", element: <Navigate to="/404" replace /> },
];
