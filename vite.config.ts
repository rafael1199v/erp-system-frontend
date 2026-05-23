import tailwindcss from "@tailwindcss/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const base = env.VITE_APP_PUBLIC_PATH || "/";
	const isProduction = mode === "production";

	const inventoryApiTarget = env.INVENTORY_API_TARGET || "http://localhost:5143";
	const salesApiTarget = env.SALES_API_TARGET || "http://localhost:5074";
	const purchasesApiTarget = env.PURCHASES_API_TARGET || "http://localhost:5229";

	return {
		base,
		plugins: [
			react(),
			vanillaExtractPlugin({
				identifiers: ({ debugId }) => `${debugId}`,
			}),
			tailwindcss(),
			tsconfigPaths(),

			isProduction &&
				visualizer({
					open: true,
					gzipSize: true,
					brotliSize: true,
					template: "treemap",
				}),
		].filter(Boolean),

		server: {
			open: true,
			host: true,
			port: 3001,
			proxy: {
				"/api/inventory": {
					target: inventoryApiTarget,
					changeOrigin: true,
					secure: false,
				},
				"/api/sales": {
					target: salesApiTarget,
					changeOrigin: true,
					secure: false,
				},
				"/api/purchases/": {
					target: purchasesApiTarget,
					changeOrigin: true,
					secure: false,
				},
			},
		},

		build: {
			target: "esnext",
			minify: "esbuild",
			sourcemap: !isProduction,
			cssCodeSplit: true,
			chunkSizeWarningLimit: 1500,
			rollupOptions: {
				output: {
					manualChunks: {
						"vendor-core": ["react", "react-dom", "react-router"],
						"vendor-ui": ["antd", "@ant-design/cssinjs", "styled-components"],
						"vendor-utils": ["axios", "dayjs", "i18next", "zustand", "@iconify/react"],
						"vendor-charts": ["apexcharts", "react-apexcharts"],
					},
				},
			},
		},

		optimizeDeps: {
			include: ["react", "react-dom", "react-router", "antd", "axios", "dayjs"],
			exclude: ["@iconify/react"],
		},

		esbuild: {
			drop: isProduction ? ["console", "debugger"] : [],
			legalComments: "none",
			target: "esnext",
		},
	};
});
