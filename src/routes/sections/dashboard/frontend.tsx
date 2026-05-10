import type { RouteObject } from "react-router";
import { Navigate } from "react-router";
import DashboardAnalysisPage from "@/feature/dashboard/pages/analysis";
import PurchaseOrderCreatePage from "@/feature/purchases/pages/order-create";
import PurchaseOrderDetailPage from "@/feature/purchases/pages/order-detail";
import PurchaseOrdersPage from "@/feature/purchases/pages/orders";
import CheckoutPage from "@/feature/sales/pages/checkout";
import KdsPage from "@/feature/sales/pages/kds";
import OrderPage from "@/feature/sales/pages/order";
import OrderDetailPage from "@/feature/sales/pages/order-detail";
import TaxPage from "@/feature/sales/pages/tax";
import { Component } from "./utils";

export function getFrontendDashboardRoutes(): RouteObject[] {
	const frontendDashboardRoutes: RouteObject[] = [
		//{ path: "workbench", element: Component("/pages/dashboard/workbench") },
		{ path: "analysis", element: <DashboardAnalysisPage /> },
		{ path: "products", element: Component("/pages/product") },
		{ path: "products/form", element: Component("/pages/product/form") },
		{ path: "products/form/:id", element: Component("/pages/product/form") },
		{ path: "stock", element: Component("/pages/stock") },
		{ path: "transaction-details/:productId", element: Component("/pages/transaction-details") },
		{ path: "movements/incoming", element: Component("/pages/movements/incoming") },
		{ path: "movements/outgoing", element: Component("/pages/movements/outgoing") },
		{ path: "movements/history", element: Component("/pages/movements/history") },
		{ path: "movements/incoming/form", element: Component("/pages/movements/incoming/form") },
		{ path: "movements/outgoing/form", element: Component("/pages/movements/outgoing/form") },
		{ path: "categories", element: Component("/pages/category") },
		{ path: "units", element: Component("/pages/unit") },

		{
			path: "sales",
			children: [
				{ index: true, element: <Navigate to="tickets" replace /> },
				{ path: "tickets", element: <OrderPage /> },
				{ path: "tickets/:ticketCen", element: <OrderDetailPage /> },
				{ path: "tickets/:ticketCen/checkout", element: <CheckoutPage /> },
				{ path: "tax", element: <TaxPage /> },
				{ path: "kds", element: <KdsPage /> },
			],
		},
		{
			path: "purchases",
			children: [
				{ index: true, element: <Navigate to="orders" replace /> },
				{ path: "orders", element: <PurchaseOrdersPage /> },
				{ path: "orders/new", element: <PurchaseOrderCreatePage /> },
				{ path: "orders/:orderCen", element: <PurchaseOrderDetailPage /> },
			],
		},
		// {
		// 	path: "components",
		// 	children: [
		// 		{ index: true, element: <Navigate to="animate" replace /> },
		// 		{ path: "animate", element: Component("/pages/components/animate") },
		// 		{ path: "scroll", element: Component("/pages/components/scroll") },
		// 		{ path: "multi-language", element: Component("/pages/components/multi-language") },
		// 		{ path: "icon", element: Component("/pages/components/icon") },
		// 		{ path: "upload", element: Component("/pages/components/upload") },
		// 		{ path: "chart", element: Component("/pages/components/chart") },
		// 		{ path: "toast", element: Component("/pages/components/toast") },
		// 	],
		// },
		// {
		// 	path: "functions",
		// 	children: [
		// 		{ index: true, element: <Navigate to="clipboard" replace /> },
		// 		{ path: "clipboard", element: Component("/pages/functions/clipboard") },
		// 		{ path: "token_expired", element: Component("/pages/functions/token-expired") },
		// 	],
		// },
		// {
		// 	path: "management",
		// 	children: [
		// 		{ index: true, element: <Navigate to="user" replace /> },
		// 		{
		// 			path: "user",
		// 			children: [
		// 				{ index: true, element: <Navigate to="profile" replace /> },
		// 				{ path: "profile", element: Component("/pages/management/user/profile") },
		// 				{ path: "account", element: Component("/pages/management/user/account") },
		// 			],
		// 		},
		// 		{
		// 			path: "system",
		// 			children: [
		// 				{ index: true, element: <Navigate to="permission" replace /> },
		// 				{ path: "permission", element: Component("/pages/management/system/permission") },
		// 				{ path: "role", element: Component("/pages/management/system/role") },
		// 				{ path: "user", element: Component("/pages/management/system/user") },
		// 				{ path: "user/:id", element: Component("/pages/management/system/user/detail") },
		// 			],
		// 		},
		// 	],
		// },
		// {
		// 	path: "error",
		// 	children: [
		// 		{ index: true, element: <Navigate to="403" replace /> },
		// 		{ path: "403", element: Component("/pages/sys/error/Page403") },
		// 		{ path: "404", element: Component("/pages/sys/error/Page404") },
		// 		{ path: "500", element: Component("/pages/sys/error/Page500") },
		// 	],
		// },
		// {
		// 	path: "menu_level",
		// 	children: [
		// 		{ index: true, element: <Navigate to="1a" replace /> },
		// 		{ path: "1a", element: Component("/pages/menu-level/menu-level-1a") },
		// 		{
		// 			path: "1b",
		// 			children: [
		// 				{ index: true, element: <Navigate to="2a" replace /> },
		// 				{ path: "2a", element: Component("/pages/menu-level/menu-level-1b/menu-level-2a") },
		// 				{
		// 					path: "2b",
		// 					children: [
		// 						{ index: true, element: <Navigate to="3a" replace /> },
		// 						{ path: "3a", element: Component("/pages/menu-level/menu-level-1b/menu-level-2b/menu-level-3a") },
		// 						{ path: "3b", element: Component("/pages/menu-level/menu-level-1b/menu-level-2b/menu-level-3b") },
		// 					],
		// 				},
		// 			],
		// 		},
		// 	],
		// },
		// {
		// 	path: "link",
		// 	children: [
		// 		{ index: true, element: <Navigate to="iframe" replace /> },
		// 		{ path: "iframe", element: Component("/pages/sys/others/link/iframe", { src: "https://ant.design/index-cn" }) },
		// 		{
		// 			path: "external-link",
		// 			element: Component("/pages/sys/others/link/external-link", { src: "https://ant.design/index-cn" }),
		// 		},
		// 	],
		// },
		// {
		// 	path: "permission",
		// 	children: [
		// 		{ index: true, element: Component("/pages/sys/others/permission") },
		// 		{ path: "page-test", element: Component("/pages/sys/others/permission/page-test") },
		// 	],
		// },
		// { path: "calendar", element: Component("/pages/sys/others/calendar") },
		// { path: "kanban", element: Component("/pages/sys/others/kanban") },
		// { path: "blank", element: Component("/pages/sys/others/blank") },
	];
	return frontendDashboardRoutes;
}
