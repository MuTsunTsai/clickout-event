import { defineConfig, devices } from "@playwright/test";

import type { BuildOptions } from "./test/fixtures";

export default defineConfig<BuildOptions>({
	testDir: "test/specs",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	reporter: process.env.CI ? "github" : "list",
	projects: [
		// The published minified build, tested on all three browser engines
		{ name: "chromium", use: { ...devices["Desktop Chrome"], build: "dist" } },
		{ name: "firefox", use: { ...devices["Desktop Firefox"], build: "dist" } },
		{ name: "webkit", use: { ...devices["Desktop Safari"], build: "dist" } },
		// The unminified build
		{ name: "chromium-unminified", use: { ...devices["Desktop Chrome"], build: "test/html" } },
	],
});
