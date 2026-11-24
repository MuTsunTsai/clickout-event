import { defineConfig, type LibConfig } from "@rslib/core";

import pkg from "./package.json" with { type: "json" };

const banner = `/**
 * ${pkg.name} v${pkg.version}
 * (c) 2020-${new Date().getFullYear()} Mu-Tsun Tsai
 * Released under the MIT License.
 */`;

const common: LibConfig = {
	format: "iife",
	syntax: "es2015",
	dts: false,
	output: {
		filename: { js: "clickout-event.js" },
		// test/html also contains the test pages, so the output folder must not be cleaned
		cleanDistPath: false,
	},
};

export default defineConfig({
	source: {
		entry: { index: "./src/index.ts" },
	},
	lib: [
		// Unminified build, used by the test pages in test/html
		{
			...common,
			output: {
				...common.output,
				distPath: "test/html",
				minify: false,
			},
		},
		// Minified build for publishing
		{
			...common,
			banner: { js: banner },
			output: {
				...common.output,
				distPath: "dist",
				minify: {
					js: true,
					css: false,
					jsOptions: {
						minimizerOptions: {
							compress: {
								evaluate: false,
								properties: false,
								unsafe_arrows: true,
							},
							format: {
								comments: false,
							},
						},
					},
				},
			},
		},
	],
});
