/// <reference path="shorthands.ts" />

const checkRecursive = (el: Node) => {
	if(is(el, HTMLElement_)) {
		if(el[outSymbol]) {
			addElement(el); // reattach
		} else {
			each(targetEvents, e => {
				let oneout = on_ + e + out_ as TargetOnOutEvents;
				let attr = el.getAttribute(oneout);
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

const processOut = (event: MouseEvent | TouchEvent) => {
	if(sortNeeded) {
		outList.sort(elementSort);
		sortNeeded = false;
	}
	let target = event[target_] as Node;

	if(is(event, MouseEvent_)) {
		event = new MouseEvent_(event.type + out_,
			Object_.assign({}, event, {
				relatedTarget: target
			})
		);
	} else {
		event = new TouchEvent(event.type + out_, event as any);
	}
	event[stopList_] = [];

	// Loops from top-down
	each(outList, el => {
		if(!contains(el, target) && !event[stopList_].some(c => contains(c, el))) {
			el.dispatchEvent(event);
		}
	});
};

const eventPatchFactory = (func: Function) => function(this: MouseEvent | TouchEvent) {
	let ev = this, type = ev.type as TargetEvents;
	func.apply(ev);
	if(targetEvents.has(type)) processOut(ev);
	if(targetOutEvents.has(type)) ev[stopList_].push(ev[target_] as HTMLElement);
};

const patch = <T, K extends keyof T>(proto: T, method: K, factory: (org: T[K]) => T[K]) =>
	proto[method] = factory(proto[method]);

function attributeListener(this: HTMLElement, event: Event) {
	let listener = this[outSymbol][on_ + event.type as TargetOnOutEvents];
	if(listener) listener.apply(this, [event]);
};