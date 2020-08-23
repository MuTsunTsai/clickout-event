/// <reference path="functions.ts" />

/**
 * Keeps a list of all OutElements that are currently in the DOM,
 * ordered from top level element to deeper level elements.
 */
let outList: HTMLElement[] = [];

let sortNeeded = false;

each(targetEvents, event => {
	// Add top-level event listener.
	document_[addEventListener_](event, processOut as EventListener);

	// Create out-event attributes.
	let oneout = on_ + event + out_ as TargetOnOutEvents;
	Object_.defineProperty(HTMLElementPrototype, oneout, {
		get(this: HTMLElement) { return this[outSymbol][oneout]; },
		set(this: HTMLElement, value: EventListenerOrEventListenerObject) {
			// Registering duplicate listener has no effect.
			this[addEventListener_](event + out_, attributeListener);
			this[outSymbol][oneout] = typeof value == "object" ? value.handleEvent : value;
		}
	});
});

// Patch prototypes.

patch(HTMLElementPrototype, addEventListener_, ael => function(this: HTMLElement, ...args: any) {
	if(targetOutEvents.has(args[0])) addElement(this);
	ael.apply(this, args);
});
patch(HTMLElementPrototype, setAttribute_, sa => function(this: HTMLElement, ...args: any) {
	if(targetOnOutEvents.has(args[0])) {
		this[args[0] as TargetOnOutEvents] = new Function(args[1]) as EventListener;
	}
	else sa.apply(this, args);
});
patch(EventPrototype, "stopPropagation", eventPatchFactory);
patch(EventPrototype, "stopImmediatePropagation", eventPatchFactory);

// Observe mutation of the entire document.

new MutationObserver((list: MutationRecord[]) => {
	each(list, record => {
		each(record.addedNodes, checkRecursive);
		each(record.removedNodes, n => {
			if(is(n, HTMLElement_)) {
				outList = outList.filter(c => !contains(n, c));
			}
		});
	});
}).observe(document_.documentElement, {
	childList: true,
	subtree: true
});

checkRecursive(document_.body);