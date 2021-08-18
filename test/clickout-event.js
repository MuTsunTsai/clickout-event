"use strict";
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
const TouchEvent_ = (typeof (TouchEvent) != "undefined" ? TouchEvent : undefined);
const HTMLElement_ = HTMLElement;
const HTMLElementPrototype = HTMLElement_[prototype_];
const EventPrototype = Event[prototype_];
const events = [
    click_,
    'dbl' + click_,
    'mousedown', 'mouseup',
    'touchstart', 'touchend',
    'pointerdown', 'pointerup'
];
const targetEvents = new Set(events);
const targetOnOutEvents = new Set(events.map(e => on_ + e + out_));
const is = (a, b) => !!b && (a instanceof b);
const contains = (a, b) => a.contains(b);
const each = (list, action) => {
    for (let item of list)
        action(item);
};
const checkRecursive = (el) => {
    if (is(el, HTMLElement_)) {
        if (el[outSymbol]) {
            addElement(el);
        }
        else {
            each(targetEvents, e => {
                let onEventOut = on_ + e + out_;
                let attr = el.getAttribute(onEventOut);
                if (attr && !manager(el)[onEventOut])
                    el[setAttribute_](onEventOut, attr);
            });
        }
        each(el.childNodes, checkRecursive);
    }
};
const manager = (el) => el[outSymbol] = el[outSymbol] || {};
const addElement = (el) => {
    manager(el);
    if (outList.includes(el))
        return;
    outList.push(el);
    sortNeeded = true;
};
const elementSort = (e1, e2) => {
    if (contains(e2, e1))
        return 1;
    if (contains(e1, e2))
        return -1;
    return 0;
};
const processOut = (event) => {
    if (sortNeeded) {
        outList.sort(elementSort);
        sortNeeded = false;
    }
    let target = event[target_];
    if (is(event, TouchEvent_)) {
        event = new TouchEvent_(event.type + out_, event);
        event[relatedTarget_] = target;
    }
    else {
        event = new event.constructor(event.type + out_, Object_.assign({}, event, { [relatedTarget_]: target }));
    }
    event[stop_] = [];
    each(outList, el => {
        if (!contains(el, target) && !event[stop_].some(c => contains(c, el))) {
            el.dispatchEvent(event);
        }
    });
};
const eventPatchFactory = (func) => function () {
    let ev = this, type = ev.type;
    func[apply_](ev);
    if (targetOnOutEvents.has(on_ + type))
        ev[stop_].push(ev[target_]);
};
const patch = (proto, method, factory) => proto[method] = factory(proto[method]);
function attributeListener(event) {
    let listener = this[outSymbol][on_ + event.type];
    if (listener)
        listener[apply_](this, [event]);
}
;
let outList = [];
let sortNeeded = false;
let virtual = document_.createElement(body_);
each(targetEvents, event => {
    document_[addEventListener_](event, processOut, {
        passive: true,
        capture: true
    });
    let onEventOut = on_ + event + out_;
    Object_.defineProperty(HTMLElementPrototype, onEventOut, {
        get() { return this[outSymbol][onEventOut]; },
        set(value) {
            this[addEventListener_](event + out_, attributeListener);
            this[outSymbol][onEventOut] = typeof value == "object" ? value.handleEvent : value;
        }
    });
});
patch(HTMLElementPrototype, addEventListener_, ael => function (...args) {
    if (targetOnOutEvents.has(on_ + args[0]))
        addElement(this);
    ael[apply_](this, args);
});
patch(HTMLElementPrototype, setAttribute_, sa => function (qualifiedName, value) {
    if (targetOnOutEvents.has(qualifiedName)) {
        sa[apply_](virtual, [on_ + click_, value]);
        this[qualifiedName] = virtual[on_ + click_];
    }
    else {
        sa[apply_](this, [qualifiedName, value]);
    }
});
patch(EventPrototype, stop_ + Propagation_, eventPatchFactory);
patch(EventPrototype, stop_ + "Immediate" + Propagation_, eventPatchFactory);
new MutationObserver((list) => {
    each(list, record => {
        each(record.addedNodes, checkRecursive);
        each(record.removedNodes, n => {
            if (is(n, HTMLElement_)) {
                outList = outList.filter(c => !contains(n, c));
            }
        });
    });
}).observe(document_.documentElement, {
    childList: true,
    subtree: true
});
checkRecursive(document_[body_]);
