import { Icon } from "@/components/icon";
import type { NavProps } from "@/components/nav";
//import { Badge } from "@/ui/badge";

export const frontendNavData: NavProps["data"] = [
	{
		name: "sys.nav.dashboard",
		items: [
			{
				title: "sys.nav.analysis",
				path: "/analysis",
				icon: <Icon icon="local:ic-analysis" size="24" />,
			},
		],
	},
	{
		name: "Inventario",
		items: [
			{
				title: "sys.nav.products",
				path: "/products",
				icon: <Icon icon="local:ic-product" size="24" />,
			},
			{
				title: "sys.nav.stock",
				path: "/stock",
				icon: <Icon icon="local:bi-boxes" size="24" />,
			},
			{
				title: "Categorias",
				path: "/categories",
				icon: <Icon icon="local:bi-boxes" size="24" />,
			},
			{
				title: "Unidades",
				path: "/units",
				icon: <Icon icon="local:bi-boxes" size="24" />,
			},
			{
				title: "sys.nav.incoming",
				path: "/movements/incoming",
				icon: <Icon icon="local:ic-incoming" size="24" />,
			},
			{
				title: "sys.nav.outgoing",
				path: "/movements/outgoing",
				icon: <Icon icon="local:ic-outgoing" size="24" />,
			},
			{
				title: "sys.nav.history",
				path: "/movements/history",
				icon: <Icon icon="local:ic-history" size="24" />,
			},
		],
	},
	{
		name: "Ventas",
		items: [
			{
				title: "Impuesto",
				path: "sales/tax",
				icon: <Icon icon="local:bi-boxes" size="24" />,
			},
		],
	},
];
