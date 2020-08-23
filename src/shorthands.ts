/// <reference path="types.ts" />

// These constants are defined mainly for shortening the transpiled result.

const on_ = 'on';
const out_ = 'out';
const target_ = 'target';
const stopList_ = 'stopList';
const dataset = 'dataset';
const addEventListener_ = "addEventListener";
const setAttribute_ = "setAttribute";
const prototype_ = "prototype";
const outSymbol = Symbol(out_);

const Object_ = Object;
const document_ = document;
const MouseEvent_ = MouseEvent;
const HTMLElement_ = HTMLElement;
const HTMLElementPrototype = HTMLElement_[prototype_];
const EventPrototype = Event[prototype_];

interface HTMLElement extends GlobalOutEventHandlers {
	[outSymbol]: GlobalOutEventHandlers;
}

const events: ReadonlyArray<TargetEvents> = ['click', 'dblclick', 'mousedown', 'mouseup', 'touchstart', 'touchend'];
const targetEvents: ReadonlySet<TargetEvents> = new Set(events);
const targetOutEvents: ReadonlySet<string> = new Set(events.map(e => e + out_));
const targetOnOutEvents: ReadonlySet<TargetOnOutEvents> = new Set(events.map(e => on_ + e + out_ as TargetOnOutEvents));

const is = <T>(a: any, b: new (...args: any) => T): a is T => a instanceof b;
const contains = (a: Node, b: Node) => a.contains(b);
const each = <T>(list: Iterable<T>, action: (item: T) => void) => {
	for(let item of list) action(item);
};
