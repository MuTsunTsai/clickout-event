import { expect, test } from "../fixtures";

import type { Page } from "@playwright/test";

type Log = { log: string[] };

/** Puts an #inside and an #outside element on the blank page. */
async function setup(page: Page, html = `<div id="inside">inside</div>`) {
	await page.evaluate(html => {
		(window as unknown as Log).log = [];
		document.body.innerHTML = html + `<div id="outside">outside</div>`;
	}, html);
}

const log = (page: Page) => page.evaluate(() => (window as unknown as Log).log);

test.beforeEach(async ({ open }) => {
	await open("blank.htm");
});

test("dynamically added elements with an onclickout attribute are picked up", async ({ page }) => {
	await setup(page, `<div id="inside" onclickout="log.push(event.type)">inside</div>`);
	await page.locator("#outside").click();
	await page.locator("#inside").click();
	expect(await log(page)).toEqual(["clickout"]);
});

test("relatedTarget is the clicked element for addEventListener listeners", async ({ page }) => {
	await setup(page);
	await page.evaluate(() => {
		document.getElementById("inside")!.addEventListener("clickout", e => {
			(window as unknown as Log).log.push(`${e.type}:${((e as MouseEvent).relatedTarget as HTMLElement).id}`);
		});
	});
	await page.locator("#outside").click();
	expect(await log(page)).toEqual(["clickout:outside"]);
});

test("the onclickout property can set, get, and clear the listener", async ({ page }) => {
	await setup(page);
	const isSame = await page.evaluate(() => {
		const el = document.getElementById("inside")!;
		const handler = () => (window as unknown as Log).log.push("handler");
		el.onclickout = handler;
		return el.onclickout === handler;
	});
	expect(isSame).toBe(true);

	await page.locator("#outside").click();
	await page.evaluate(() => document.getElementById("inside")!.onclickout = null!);
	await page.locator("#outside").click();
	expect(await log(page)).toEqual(["handler"]);
});

test("onclickout can be set with setAttribute", async ({ page }) => {
	await setup(page);
	await page.evaluate(() => document.getElementById("inside")!.setAttribute("onclickout", "log.push('attr')"));
	await page.locator("#outside").click();
	expect(await log(page)).toEqual(["attr"]);
});

test("detached elements stop receiving events until reattached", async ({ page }) => {
	await setup(page);
	await page.evaluate(() => {
		const w = window as unknown as Log & { detached: HTMLElement };
		const el = w.detached = document.getElementById("inside")!;
		el.addEventListener("clickout", () => w.log.push("clickout"));
		el.remove();
	});
	await page.locator("#outside").click();
	expect(await log(page)).toEqual([]);

	await page.evaluate(() => document.body.prepend((window as unknown as { detached: HTMLElement }).detached));
	await page.locator("#outside").click();
	expect(await log(page)).toEqual(["clickout"]);
});

test("dblclickout fires on double clicks outside the element", async ({ page }) => {
	await setup(page, `<div id="inside" ondblclickout="log.push(event.type)">inside</div>`);
	await page.locator("#inside").dblclick();
	await page.locator("#outside").dblclick();
	expect(await log(page)).toEqual(["dblclickout"]);
});

test("clicking inside a shadow tree counts as inside for ancestors across the boundary", async ({ page }) => {
	await setup(page, `<div id="inside"><div id="host"></div></div>`);
	await page.evaluate(() => {
		const w = window as unknown as Log;
		const root = document.getElementById("host")!.attachShadow({ mode: "open" });
		root.innerHTML = `<div id="shadow">shadow</div><div id="sibling">sibling</div>`;
		document.getElementById("inside")!.addEventListener("clickout", () => w.log.push("inside"));
		root.getElementById("shadow")!.addEventListener("clickout", e => {
			w.log.push(`shadow:${((e as MouseEvent).relatedTarget as HTMLElement).id}`);
		});
	});

	await page.locator("#shadow").click();
	expect(await log(page)).toEqual([]);

	await page.locator("#sibling").click();
	expect(await log(page)).toEqual(["shadow:sibling"]);

	await page.locator("#outside").click();
	expect((await log(page)).toSorted()).toEqual(["inside", "shadow:outside", "shadow:sibling"]);
});

test.describe("touch events", () => {
	test.use({ hasTouch: true });

	test("tapping outside fires touchstartout and touchendout with relatedTarget", async ({ page }) => {
		await setup(page);
		await page.evaluate(() => {
			const el = document.getElementById("inside")!;
			for(const type of ["touchstartout", "touchendout"]) {
				el.addEventListener(type, e => {
					(window as unknown as Log).log.push(`${e.type}:${((e as TouchEvent).relatedTarget as HTMLElement).id}`);
				});
			}
		});
		await page.locator("#inside").tap();
		await page.locator("#outside").tap();
		expect(await log(page)).toEqual(["touchstartout:outside", "touchendout:outside"]);
	});
});
