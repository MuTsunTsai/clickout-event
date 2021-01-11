/// <reference path="shorthands.ts" />

const checkRecursive = (el: Node) => {
	if(is(el, HTMLElement_)) {
		if(el[outSymbol]) {
			// Reattachment of an OutElement.
			addElement(el);
		} else {
			// Check if there is any inline attributes.
			each(targetEvents, e => {
				let oneout = on_ + e + out_ as TargetOnOutEvents;
				let attr = el.getAttribute(oneout);

				// Inline attribute translates to oneventout handlers only if the latter is not set,
				// according to the native browser behaviors.
				if(attr && !manager(el)[oneout]) el[setAttribute_](oneout, attr);
			});
		}
		each(el.childNodes, checkRecursive);
	}
};

const manager = (el: HTMLElement) => el[outSymbol] = el[outSymbol] || {};

const addElement = (el: HTMLElement) => {
	manager(el);
	if(outList.includes(el)) return;
	outList.push(el);
	sortNeeded = true;
};

const elementSort = (e1: Node, e2: Node) => {
	if(contains(e2, e1)) return 1;
	if(contains(e1, e2)) return -1;
	return 0;
};

const processOut = (event: TouchEvent | PointerEvent) => {
	if(sortNeeded) {
		outList.sort(elementSort);
		sortNeeded = false;
	}
	let target = event[target_] as Node;

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

const eventPatchFactory = (func: Function) => function(this: TouchEvent | PointerEvent) {
	let ev = this, type = ev.type as TargetEvents;
	func[apply_](ev);
	if(targetEvents.has(type)) processOut(ev);
	if(targetOnOutEvents.has(on_ + type as any)) ev[stop_].push(ev[target_] as HTMLElement);
};

const patch = <T, K extends keyof T>(proto: T, method: K, factory: (org: T[K]) => T[K]) =>
	proto[method] = factory(proto[method]);

function attributeListener(this: HTMLElement, event: Event) {
	let listener = this[outSymbol][on_ + event.type as TargetOnOutEvents];
	if(listener) listener[apply_](this, [event]);
};