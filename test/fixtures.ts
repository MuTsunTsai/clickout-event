import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { test as base } from "@playwright/test";

export { expect } from "@playwright/test";

export interface BuildOptions {
	/** The build to test: `dist` is minified, `test/html` is unminified. */
	build: "dist" | "test/html";
}

interface Fixtures {
	/** Opens a page in the test/html folder. */
	open: (name: string) => Promise<void>;
}

/** A virtual origin; all requests to it are fulfilled from local files by page.route. */
const ORIGIN = "http://clickout.test";
const ROOT = resolve(import.meta.dirname, "..");

/** A blank page that loads nothing but clickout-event. */
const BLANK_PAGE = `<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<script src="clickout-event.js"></script>
</head>
<body></body>
</html>`;

const TYPES: Record<string, string> = {
	".htm": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
};

export const test = base.extend<BuildOptions & Fixtures>({
	build: ["dist", { option: true }],

	open: async ({ page, build }, use) => {
		await page.route(ORIGIN + "/**", async route => {
			const name = new URL(route.request().url()).pathname.slice(1);
			if(name == "blank.htm") return route.fulfill({ contentType: TYPES[".htm"], body: BLANK_PAGE });

			const file = name == "clickout-event.js" ? join(ROOT, build, name) : join(ROOT, "test/html", name);
			try {
				const body = await readFile(file);
				await route.fulfill({ contentType: TYPES[name.slice(name.lastIndexOf("."))], body });
			} catch {
				await route.fulfill({ status: 404 });
			}
		});
		await use(async name => {
			await page.goto(`${ORIGIN}/${name}`);
		});
	},
});
