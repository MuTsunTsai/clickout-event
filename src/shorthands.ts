import type { GlobalOutEventHandlers, TargetEvents, TargetOnOutEvents } from "./types";

// These constants are defined mainly for shortening the transpiled result.

export const on_ = 'on';
export const out_ = 'out';
export const body_ = 'body';
export const stop_ = 'stop';
export const click_ = 'click';
export const apply_ = 'apply';
export const target_ = 'target';
export const dataset_ = 'dataset';
export const prototype_ = "prototype";
export const Propagation_ = 'Propagation';
export const setAttribute_ = "setAttribute";
export const relatedTarget_ = 'relatedTarget';
export const addEventListener_ = "addEventListener";

export const outSymbol = Symbol(out_);

export const Object_ = Object;
export const document_ = document;
export const TouchEvent_: typeof TouchEvent = (typeof (TouchEvent) != "undefined" ? TouchEvent : undefined) as any;
export const HTMLElement_ = HTMLElement;
export const HTMLElementPrototype = HTMLElement_[prototype_];
export const EventPrototype = Event[prototype_];

declare global {
	interface HTMLElement extends GlobalOutEventHandlers {
		/** An object containing the actual inline event listeners. */
		[outSymbol]: GlobalOutEventHandlers;
	}
}

export const events: ReadonlyArray<TargetEvents> = [
	click_, 'dbl' + click_ as 'dblclick',
	'mousedown', 'mouseup',
	'touchstart', 'touchend',
	'pointerdown', 'pointerup'
];
export const targetEvents: ReadonlySet<TargetEvents> = new Set(events);
export const targetOnOutEvents: ReadonlySet<TargetOnOutEvents> = new Set(events.map(e => on_ + e + out_ as TargetOnOutEvents));

export const is = <T>(a: any, b: new (...args: any) => T): a is T => !!b && (a instanceof b);
/**
 * Shadow-DOM-aware version of `Node.contains()`;
 * crosses shadow root boundaries by continuing from the shadow host.
 */
export const contains = (a: Node, b: Node | null) => {
	for(; b; b = b.parentNode || (b as ShadowRoot).host) if(a == b) return true;
	return false;
};
export const each = <T>(list: Iterable<T>, action: (item: T) => void) => {
	for(let item of list) action(item);
};
