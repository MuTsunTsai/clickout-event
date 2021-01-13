/// <reference path="types.ts" />

// These constants are defined mainly for shortening the transpiled result.

const on_ = 'on';
const out_ = 'out';
const body_ = 'body';
const stop_ = 'stop';
const click_ = 'click';
const apply_ = 'apply';
const target_ = 'target';
const dataset_ = 'dataset';
const prototype_ = "prototype";
const Propagation_ = 'Propagation';
const setAttribute_ = "setAttribute";
const relatedTarget_ = 'relatedTarget';
const addEventListener_ = "addEventListener";

const outSymbol = Symbol(out_);

const Object_ = Object;
const document_ = document;
const TouchEvent_: typeof TouchEvent = (typeof (TouchEvent) != "undefined" ? TouchEvent : undefined) as any;
const HTMLElement_ = HTMLElement;
const HTMLElementPrototype = HTMLElement_[prototype_];
const EventPrototype = Event[prototype_];

interface HTMLElement extends GlobalOutEventHandlers {
	/** An object containing the actual inline event listeners. */
	[outSymbol]: GlobalOutEventHandlers;
}

const events: ReadonlyArray<TargetEvents> = [
	click_, 'dbl' + click_ as 'dblclick',
	'mousedown', 'mouseup',
	'touchstart', 'touchend',
	'pointerdown', 'pointerup'
];
const targetEvents: ReadonlySet<TargetEvents> = new Set(events);
const targetOnOutEvents: ReadonlySet<TargetOnOutEvents> = new Set(events.map(e => on_ + e + out_ as TargetOnOutEvents));

const is = <T>(a: any, b: new (...args: any) => T): a is T => !!b && (a instanceof b);
const contains = (a: Node, b: Node) => a.contains(b);
const each = <T>(list: Iterable<T>, action: (item: T) => void) => {
	for(let item of list) action(item);
};
