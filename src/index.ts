/// <reference path="functions.ts" />

/**
 * Keeps a list of all OutElements that are currently in the DOM,
 * ordered from top level element to deeper level elements.
 */
let outList: HTMLElement[] = [];

let sortNeeded = false;

/**
 * Create a virtual element for parsing inline event attribute.
 * It really doesn't matter what type of element we use here;
 * we use body just for reusing keyword.
 */
let virtual = document_.createElement(body_);

each(targetEvents, event => {
	// Add top-level event listener.
	document_[addEventListener_](event, processOut as EventListener, { passive: true });

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
	if(targetOnOutEvents.has(on_ + args[0] as any)) addElement(this);
	ael[apply_](this, args);
});
patch(HTMLElementPrototype, setAttribute_, sa => function(this: HTMLElement, qualifiedName: string, value: string) {
	if(targetOnOutEvents.has(qualifiedName as any)) {
		// Parse the attribute using native mechanism,
		// in order to achieve consistent behavior regarding content-security-policy.
		// It doesn't really matter which event we use here;
		// we use onclick just for reusing keyword.
		sa[apply_](virtual, [on_ + click_, value]);
		this[qualifiedName as TargetOnOutEvents] = virtual[on_ + click_ as "onclick"] as EventListener;
	} else {
		sa[apply_](this, [qualifiedName, value]);
	}
});
patch(EventPrototype, stop_ + Propagation_ as any, eventPatchFactory);
patch(EventPrototype, stop_ + "Immediate" + Propagation_ as any, eventPatchFactory);

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

// Process contents before the current script tag, if any.
checkRecursive(document_[body_]);