import {
	HTMLElement_, Object_, TouchEvent_, apply_, contains, each, is, on_, out_,
	outSymbol, relatedTarget_, setAttribute_, stop_, target_, targetEvents, targetOnOutEvents,
} from "./shorthands";

import type { TargetEvents, TargetOnOutEvents } from "./types";

/**
 * Keeps a list of all OutElements that are currently in the DOM,
 * ordered from top level element to deeper level elements.
 */
let outList: HTMLElement[] = [];

let sortNeeded = false;

export const checkRecursive = (el: Node) => {
	if(is(el, HTMLElement_)) {
		if(el[outSymbol]) {
			// Reattachment of an OutElement.
			addElement(el);
		} else {
			// Check if there is any inline attributes.
			each(targetEvents, e => {
				let onEventOut = on_ + e + out_ as TargetOnOutEvents;
				let attr = el.getAttribute(onEventOut);

				// Inline attribute translates to onEventOut handlers only if the latter is not set,
				// according to the native browser behaviors.
				if(attr && !manager(el)[onEventOut]) el[setAttribute_](onEventOut, attr);
			});
		}
		each(el.childNodes, checkRecursive);
	}
};

const manager = (el: HTMLElement) => el[outSymbol] = el[outSymbol] || {};

export const addElement = (el: HTMLElement) => {
	manager(el);
	if(outList.includes(el)) return;
	outList.push(el);
	sortNeeded = true;
};

/** Removes all OutElements under the given node. */
export const removeElements = (n: Node) => {
	outList = outList.filter(c => !contains(n, c));
};

const elementSort = (e1: Node, e2: Node) => {
	if(contains(e2, e1)) return 1;
	if(contains(e1, e2)) return -1;
	return 0;
};

export const processOut = (event: TouchEvent | PointerEvent) => {
	if(sortNeeded) {
		outList.sort(elementSort);
		sortNeeded = false;
	}
	// event.target is retargeted to the shadow host if the actual target is inside a shadow tree,
	// so we use the composed path to find the actual target.
	let target = event.composedPath()[0] as Node;

	// TouchEvent does not have 'relatedTarget' property and have to be handled separately.
	if(is(event, TouchEvent_)) {
		event = new TouchEvent_(event.type + out_, event as any);
		event[relatedTarget_] = target;
	} else {
		event = new (event.constructor as new (...args: any) => PointerEvent)(event.type + out_,
			Object_.assign({}, event, { [relatedTarget_]: target })
		);
	}
	event[stop_] = [];

	// Loops from top-down
	each(outList, el => {
		if(!contains(el, target) && !event[stop_].some(c => contains(c, el))) {
			el.dispatchEvent(event);
		}
	});
};

export const eventPatchFactory = (func: Function) => function(this: TouchEvent | PointerEvent) {
	let ev = this, type = ev.type as TargetEvents;
	func[apply_](ev);
	if(targetOnOutEvents.has(on_ + type as any)) ev[stop_].push(ev[target_] as HTMLElement);
};

export const patch = <T, K extends keyof T>(proto: T, method: K, factory: (org: T[K]) => T[K]) =>
	proto[method] = factory(proto[method]);

export function attributeListener(this: HTMLElement, event: Event) {
	let listener = this[outSymbol][on_ + event.type as TargetOnOutEvents];
	if(listener) listener[apply_](this, [event]);
};
