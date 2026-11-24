import {
	EventPrototype, HTMLElementPrototype, HTMLElement_, Object_, Propagation_, addEventListener_,
	apply_, body_, click_, document_, each, is, on_, out_, outSymbol, setAttribute_, stop_,
	targetEvents, targetOnOutEvents,
} from "./shorthands";
import {
	addElement, attributeListener, checkRecursive, eventPatchFactory, patch, processOut, removeElements,
} from "./functions";

import type { TargetOnOutEvents } from "./types";

/**
 * Create a virtual element for parsing inline event attribute.
 * It really doesn't matter what type of element we use here;
 * we use body just for reusing keyword.
 */
let virtual = document_.createElement(body_);

each(targetEvents, event => {
	// Add top-level event listener.
	document_[addEventListener_](event, processOut as EventListener, {
		passive: true,
		/**
		 * Use capture here, so that this listener runs before almost every other event listeners,
		 * in order to prevent it from being blocked by event.stopPropagation().
		 * In the very unlikely event of the user define another capturing handler before this particular one,
		 * and at the same time stops propagation,
		 * I'm sure the user knows what is intended and therefore will not attempt to override the intention.
		 */
		capture: true
	});

	// Create out-event attributes.
	let onEventOut = on_ + event + out_ as TargetOnOutEvents;
	Object_.defineProperty(HTMLElementPrototype, onEventOut, {
		get(this: HTMLElement) { return this[outSymbol][onEventOut]; },
		set(this: HTMLElement, value: EventListenerOrEventListenerObject | null) {
			// Registering duplicate listener has no effect.
			this[addEventListener_](event + out_, attributeListener);
			// Setting null clears the listener, like native on-event handlers.
			this[outSymbol][onEventOut] = value && typeof value == "object" ? value.handleEvent : value!;
		}
	});
});

// Patch prototypes.
patch(HTMLElementPrototype, addEventListener_,
	// function keyword must be used here since we need the 'this' keyword.
	ael => function(this: HTMLElement, ...args: any) {
		if(targetOnOutEvents.has(on_ + args[0] as any)) addElement(this);
		ael[apply_](this, args);
	}
);
patch(HTMLElementPrototype, setAttribute_,
	sa => function(this: HTMLElement, qualifiedName: string, value: string) {
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
	}
);
patch(EventPrototype, stop_ + Propagation_ as any, eventPatchFactory);
patch(EventPrototype, stop_ + "Immediate" + Propagation_ as any, eventPatchFactory);

// Observe mutation of the entire document.
new MutationObserver((list: MutationRecord[]) => {
	each(list, record => {
		each(record.addedNodes, checkRecursive);
		each(record.removedNodes, n => {
			if(is(n, HTMLElement_)) removeElements(n);
		});
	});
}).observe(document_.documentElement, {
	childList: true,
	subtree: true
});

// Process contents before the current script tag, if any.
checkRecursive(document_[body_]);