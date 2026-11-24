(() => {
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/shorthands.ts
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
const TouchEvent_ = typeof TouchEvent != "undefined" ? TouchEvent : undefined;
const HTMLElement_ = HTMLElement;
const HTMLElementPrototype = HTMLElement_[prototype_];
const EventPrototype = Event[prototype_];
const events = [
    click_,
    'dbl' + click_,
    'mousedown',
    'mouseup',
    'touchstart',
    'touchend',
    'pointerdown',
    'pointerup'
];
const targetEvents = new Set(events);
const targetOnOutEvents = new Set(events.map((e)=>on_ + e + out_));
const is = (a, b)=>!!b && a instanceof b;
/**
 * Shadow-DOM-aware version of `Node.contains()`;
 * crosses shadow root boundaries by continuing from the shadow host.
 */ const contains = (a, b)=>{
    for(; b; b = b.parentNode || b.host)if (a == b) return true;
    return false;
};
const each = (list, action)=>{
    for (let item of list)action(item);
};

;// CONCATENATED MODULE: ./src/functions.ts

/**
 * Keeps a list of all OutElements that are currently in the DOM,
 * ordered from top level element to deeper level elements.
 */ let outList = [];
let sortNeeded = false;
const checkRecursive = (el)=>{
    if (is(el, HTMLElement_)) {
        if (el[outSymbol]) {
            // Reattachment of an OutElement.
            addElement(el);
        } else {
            // Check if there is any inline attributes.
            each(targetEvents, (e)=>{
                let onEventOut = (/* inlined export .on_ */"on") + e + (/* inlined export .out_ */"out");
                let attr = el.getAttribute(onEventOut);
                // Inline attribute translates to onEventOut handlers only if the latter is not set,
                // according to the native browser behaviors.
                if (attr && !manager(el)[onEventOut]) el[setAttribute_](onEventOut, attr);
            });
        }
        each(el.childNodes, checkRecursive);
    }
};
const manager = (el)=>el[outSymbol] = el[outSymbol] || {};
const addElement = (el)=>{
    manager(el);
    if (outList.includes(el)) return;
    outList.push(el);
    sortNeeded = true;
};
/** Removes all OutElements under the given node. */ const removeElements = (n)=>{
    outList = outList.filter((c)=>!contains(n, c));
};
const elementSort = (e1, e2)=>{
    if (contains(e2, e1)) return 1;
    if (contains(e1, e2)) return -1;
    return 0;
};
const processOut = (event)=>{
    if (sortNeeded) {
        outList.sort(elementSort);
        sortNeeded = false;
    }
    // event.target is retargeted to the shadow host if the actual target is inside a shadow tree,
    // so we use the composed path to find the actual target.
    let target = event.composedPath()[0];
    // TouchEvent does not have 'relatedTarget' property and have to be handled separately.
    if (is(event, TouchEvent_)) {
        event = new TouchEvent_(event.type + (/* inlined export .out_ */"out"), event);
        event[relatedTarget_] = target;
    } else {
        event = new event.constructor(event.type + (/* inlined export .out_ */"out"), Object_.assign({}, event, {
            [relatedTarget_]: target
        }));
    }
    event[(/* inlined export .stop_ */"stop")] = [];
    // Loops from top-down
    each(outList, (el)=>{
        if (!contains(el, target) && !event[(/* inlined export .stop_ */"stop")].some((c)=>contains(c, el))) {
            el.dispatchEvent(event);
        }
    });
};
const eventPatchFactory = (func)=>function() {
        let ev = this, type = ev.type;
        func[(/* inlined export .apply_ */"apply")](ev);
        if (targetOnOutEvents.has((/* inlined export .on_ */"on") + type)) ev[(/* inlined export .stop_ */"stop")].push(ev[(/* inlined export .target_ */"target")]);
    };
const patch = (proto, method, factory)=>proto[method] = factory(proto[method]);
function attributeListener(event) {
    let listener = this[outSymbol][(/* inlined export .on_ */"on") + event.type];
    if (listener) listener[(/* inlined export .apply_ */"apply")](this, [
        event
    ]);
}

;// CONCATENATED MODULE: ./src/index.ts


/**
 * Create a virtual element for parsing inline event attribute.
 * It really doesn't matter what type of element we use here;
 * we use body just for reusing keyword.
 */ let virtual = document_.createElement((/* inlined export .body_ */"body"));
each(targetEvents, (event)=>{
    // Add top-level event listener.
    document_[addEventListener_](event, processOut, {
        passive: true,
        /**
		 * Use capture here, so that this listener runs before almost every other event listeners,
		 * in order to prevent it from being blocked by event.stopPropagation().
		 * In the very unlikely event of the user define another capturing handler before this particular one,
		 * and at the same time stops propagation,
		 * I'm sure the user knows what is intended and therefore will not attempt to override the intention.
		 */ capture: true
    });
    // Create out-event attributes.
    let onEventOut = (/* inlined export .on_ */"on") + event + (/* inlined export .out_ */"out");
    Object_.defineProperty(HTMLElementPrototype, onEventOut, {
        get () {
            return this[outSymbol][onEventOut];
        },
        set (value) {
            // Registering duplicate listener has no effect.
            this[addEventListener_](event + (/* inlined export .out_ */"out"), attributeListener);
            // Setting null clears the listener, like native on-event handlers.
            this[outSymbol][onEventOut] = value && typeof value == "object" ? value.handleEvent : value;
        }
    });
});
// Patch prototypes.
patch(HTMLElementPrototype, addEventListener_, // function keyword must be used here since we need the 'this' keyword.
(ael)=>function(...args) {
        if (targetOnOutEvents.has((/* inlined export .on_ */"on") + args[0])) addElement(this);
        ael[(/* inlined export .apply_ */"apply")](this, args);
    });
patch(HTMLElementPrototype, setAttribute_, (sa)=>function(qualifiedName, value) {
        if (targetOnOutEvents.has(qualifiedName)) {
            // Parse the attribute using native mechanism,
            // in order to achieve consistent behavior regarding content-security-policy.
            // It doesn't really matter which event we use here;
            // we use onclick just for reusing keyword.
            sa[(/* inlined export .apply_ */"apply")](virtual, [
                (/* inlined export .on_ */"on") + (/* inlined export .click_ */"click"),
                value
            ]);
            this[qualifiedName] = virtual[(/* inlined export .on_ */"on") + (/* inlined export .click_ */"click")];
        } else {
            sa[(/* inlined export .apply_ */"apply")](this, [
                qualifiedName,
                value
            ]);
        }
    });
patch(EventPrototype, (/* inlined export .stop_ */"stop") + Propagation_, eventPatchFactory);
patch(EventPrototype, (/* inlined export .stop_ */"stop") + "Immediate" + Propagation_, eventPatchFactory);
// Observe mutation of the entire document.
new MutationObserver((list)=>{
    each(list, (record)=>{
        each(record.addedNodes, checkRecursive);
        each(record.removedNodes, (n)=>{
            if (is(n, HTMLElement_)) removeElements(n);
        });
    });
}).observe(document_.documentElement, {
    childList: true,
    subtree: true
});
// Process contents before the current script tag, if any.
checkRecursive(document_[(/* inlined export .body_ */"body")]);

})()
;