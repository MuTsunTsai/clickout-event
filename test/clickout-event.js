"use strict";
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
const events = ['click', 'dblclick', 'mousedown', 'mouseup', 'touchstart', 'touchend'];
const targetEvents = new Set(events);
const targetOutEvents = new Set(events.map(e => e + out_));
const targetOnOutEvents = new Set(events.map(e => on_ + e + out_));
const is = (a, b) => a instanceof b;
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
                let oneout = on_ + e + out_;
                let attr = el.getAttribute(oneout);
                if (attr && !manager(el)[oneout])
                    el[setAttribute_](oneout, attr);
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
    if (is(event, MouseEvent_)) {
        event = new MouseEvent_(event.type + out_, Object_.assign({}, event, {
            relatedTarget: target
        }));
    }
    else {
        event = new TouchEvent(event.type + out_, event);
    }
    event[stopList_] = [];
    each(outList, el => {
        if (!contains(el, target) && !event[stopList_].some(c => contains(c, el))) {
            el.dispatchEvent(event);
        }
    });
};
const eventPatchFactory = (func) => function () {
    let ev = this, type = ev.type;
    func.apply(ev);
    if (targetEvents.has(type))
        processOut(ev);
    if (targetOutEvents.has(type))
        ev[stopList_].push(ev[target_]);
};
const patch = (proto, method, factory) => proto[method] = factory(proto[method]);
function attributeListener(event) {
    let listener = this[outSymbol][on_ + event.type];
    if (listener)
        listener.apply(this, [event]);
}
;
let outList = [];
let sortNeeded = false;
each(targetEvents, event => {
    document_[addEventListener_](event, processOut);
    let oneout = on_ + event + out_;
    Object_.defineProperty(HTMLElementPrototype, oneout, {
        get() { return this[outSymbol][oneout]; },
        set(value) {
            this[addEventListener_](event + out_, attributeListener);
            this[outSymbol][oneout] = typeof value == "object" ? value.handleEvent : value;
        }
    });
});
patch(HTMLElementPrototype, addEventListener_, ael => function (...args) {
    if (targetOutEvents.has(args[0]))
        addElement(this);
    ael.apply(this, args);
});
patch(HTMLElementPrototype, setAttribute_, sa => function (...args) {
    if (targetOnOutEvents.has(args[0])) {
        this[args[0]] = new Function(args[1]);
    }
    else
        sa.apply(this, args);
});
patch(EventPrototype, "stopPropagation", eventPatchFactory);
patch(EventPrototype, "stopImmediatePropagation", eventPatchFactory);
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
checkRecursive(document_.body);
