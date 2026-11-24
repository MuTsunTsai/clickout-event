import { expect, test } from "../fixtures";

import type { Page } from "@playwright/test";

/** The colored blocks on the test pages, and the event each of them listens to. */
const BLOCKS = {
	blue: "clickout",
	red: "mousedownout",
	yellow: "mouseupout",
	green: "pointerupout",
} as const;

type Color = keyof typeof BLOCKS;
const COLORS = Object.keys(BLOCKS) as Color[];

/** Pages that register listeners in different ways or with different frameworks. */
const PAGES = {
	"html.htm": "inline HTML attributes",
	"javascript.htm": "addEventListener",
	"jquery.htm": "jQuery",
	"vue.htm": "Vue 2",
	"vue3.htm": "Vue 3",
	"react.htm": "React",
	"preact.htm": "Preact",
	"alpine.htm": "Alpine.js",
	"angular.htm": "Angular",
	"svelte.htm": "Svelte 5",
	"lit.htm": "Lit",
};

// Frameworks may normalize the style attribute (e.g. into `background: blue;`), so match the color name only.
// Playwright locators also pierce open shadow roots.
const block = (page: Page, color: string) => page.locator(`div[style*="${color}"]`);

/**
 * Starts recording the event names written into the blocks.
 * The pages clear the text after 500ms, so a MutationObserver is used to catch them as they happen.
 */
async function startRecording(page: Page) {
	// Frameworks may render asynchronously, so wait for all blocks first.
	for(const color of COLORS) await block(page, color).waitFor();

	await page.evaluate(() => {
		const w = window as unknown as { __out: string[] };
		w.__out = [];
		const observer = new MutationObserver(records => {
			for(const record of records) {
				const el = record.target as HTMLElement;
				const text = el.innerText.trim();
				if(text) w.__out.push(`${el.style.backgroundColor}:${text}`);
			}
		});
		const options = { childList: true, subtree: true };
		observer.observe(document.body, options);

		// Changes inside shadow roots (e.g. Lit components) are not visible from the document.
		for(const el of document.body.querySelectorAll("*")) {
			if(el.shadowRoot) observer.observe(el.shadowRoot, options);
		}
	});
}

const recorded = (page: Page) => page.evaluate(() => (window as unknown as { __out: string[] }).__out.toSorted());

const expected = (colors: Color[]) => colors.map(c => `${c}:${BLOCKS[c]}`).sort();

for(const [name, title] of Object.entries(PAGES)) {
	test.describe(`${title} (${name})`, () => {
		test.beforeEach(async ({ page, open }) => {
			await open(name);
			await startRecording(page);
		});

		for(const target of COLORS) {
			test(`clicking the ${target} block fires out-events on the other blocks only`, async ({ page }) => {
				await block(page, target).click();
				await expect.poll(() => recorded(page)).toEqual(expected(COLORS.filter(c => c != target)));
			});
		}

		test("clicking outside all blocks fires out-events on every block", async ({ page }) => {
			const viewport = page.viewportSize()!;
			await page.mouse.click(viewport.width / 2, viewport.height - 10);
			await expect.poll(() => recorded(page)).toEqual(expected(COLORS));
		});
	});
}

test.describe("nested elements and stopPropagation (nested.htm)", () => {
	test.beforeEach(async ({ page, open }) => {
		await open("nested.htm");
		// Inline attributes look up the global msg() at call time, so it can be replaced to record every call.
		await page.evaluate(() => {
			const w = window as unknown as { __calls: string[]; msg: (s: string) => void };
			const msg = w.msg;
			w.__calls = [];
			w.msg = s => {
				w.__calls.push(s);
				msg(s);
			};
		});
	});

	const calls = (page: Page) => page.evaluate(() => (window as unknown as { __calls: string[] }).__calls);

	// Each block has 10px of padding, so clicking its top-left corner hits the block itself rather than the inner one.
	const corner = { position: { x: 3, y: 3 } };

	test("clicking outside: stopPropagation on the outer block suppresses the inner ones", async ({ page }) => {
		await page.locator("#msg").click();
		await expect.poll(() => calls(page)).toEqual(["white"]);
	});

	test("clicking the blue block fires red and yellow, from outer to inner", async ({ page }) => {
		await block(page, "blue").click(corner);
		await expect.poll(() => calls(page)).toEqual(["blue", "red"]);
	});

	test("clicking the red block fires only the innermost yellow block", async ({ page }) => {
		await block(page, "red").click(corner);
		await expect.poll(() => calls(page)).toEqual(["red"]);
	});

	test("clicking the innermost yellow block fires nothing", async ({ page }) => {
		await block(page, "yellow").click();
		// Events are dispatched synchronously, so anything fired would already be recorded once the click completes.
		expect(await calls(page)).toEqual([]);
	});
});
