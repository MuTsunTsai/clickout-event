# Clickout-Event

> Provides universal support for `clickout` and other similar events to any front-end frameworks.

[![npm version](https://img.shields.io/npm/v/clickout-event?logo=npm)](https://www.npmjs.com/package/clickout-event)
[![npm downloads](https://img.shields.io/npm/d18m/clickout-event?logo=npm)](https://www.npmjs.com/package/clickout-event)
[![GitHub package version](https://img.shields.io/github/package-json/v/MuTsunTsai/clickout-event?logo=github&label=GitHub)](https://github.com/MuTsunTsai/clickout-event)
[![license](https://img.shields.io/npm/l/clickout-event)](LICENSE)


There are many packages that are designed to capture and handle the
"click outside" event of an element. Some of them target vanilla JavaScript,
while some others target specific front-end framework, possibly specific version.
Front-end designers in the past had to look for the right package that works
for their particular scenario.

Look no further! Introducing Clickout-Event,
a package that provides universal support for `clickout` and other similar events.
It works in all scenarios: plain HTML `onclickout` attributes,
`.addEventListener('clickout')` of vanilla JavaScript,
`.on('clickout')` of jQuery, `v-on:clickout` directives of Vue.js, you name it. 
As long as a front-end framework internally uses `addEventListener` to handle events,
Clickout-Event works for it.

## License

MIT License

## Requirement

In order to fully implement all native event behaviors,
Clickout-Event uses the [mutation observer API](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver),
so it will not work directly for legacy browsers.
You may try using polyfills to make it work,
but I haven't tested those yet.

## Install (with module)

You can get Clickout-Event as an NPM package by running:
```bash
npm install clickout-event --save
```
Then add one of the following lines to your entry script:

```js
require('clickout-event');
// or
import 'clickout-event';
```

And watch the magic happen.

## Install (without module)

Simply download [`clickout-event.js`](https://github.com/MuTsunTsai/clickout-event/raw/master/dist/clickout-event.js).
Then all you need to do is add the script tag anywhere (as long as it is before any calling of the `addEventListener` method, such as the beginning of the `<head>` section) in your HTML file:

```html
<script src="clickout-event.js"></script>
```

## API

Clickout-Event provides the corresponding "out-events" for the following events: `click`, `dblclick`, `mousedown`, `mouseup`, `touchstart`, `touchend`, `pointerdown` and `pointerup`. The corresponding events are then called `clickout`, `dblclickout` etc. You can then use them the same way you use any other events; see examples below.

Note that pointer events is not supported in Safari.

With each out-event, you can use `event.relatedTarget` to find out exactly which element fires the original event (that is, the element being clicked etc.).

## Usage

### HTML inline attribute

```html
<div onclickout="console.log('clickout detected')">...</div>
```

### Vanilla JavaScript

```js
document.getElementById('myId').addEventListener('clickout', myListener);
```

### [jQuery](https://jquery.com/)

```js
$('#myId').on('clickout', myListener);
```

### [Vue.js](https://vuejs.org/) (both v2 and v3)

```html
<div v-on:clickout="open=false">...</div>
```

### [Angular](https://angular.io/)

```html
<div (clickout)="close()">...</div>
```

### Other frameworks

Clickout-Event is also tested with the following frameworks,
where out-events can be used directly with their event binding syntax:

| Framework | Syntax |
| --- | --- |
| [Preact](https://preactjs.com/) | `<div onclickout={close}>` |
| [Svelte](https://svelte.dev/) 5 | `<div onclickout={close}>` |
| [Alpine.js](https://alpinejs.dev/) | `<div @clickout="open = false">` |
| [Lit](https://lit.dev/) | `` html`<div @clickout=${this.close}>` `` |

Some frameworks (such as [React](https://reactjs.org/) and [Blazor](https://blazor.net/))
have a fixed list of events that are supported by their event attribute syntax,
so you cannot directly use their event attributes with out-events
(or with any custom events for that matter) in their templates.
Still, you can create custom components in these frameworks and use the vanilla
`addEventListener()` method to register event listener.

## Details

### Event propagation

You can have nested elements using the out-events. In that case,
unlike regular events, out-events fire in the top-down ordering;
that is, the parent element will fire the event first,
and then will the child elements.
Similarly, when calling `event.stopPropagation()`
(or, for example, using `v-on:clickout.stop` in Vue.js) on the out-events,
it will be the parent element stopping the child element from firing the event.

By design, even if the propagation of the original event is stopped,
the corresponding out-event will still fire regardlessly.

### Dynamic elements

Feel free to add or remove elements dynamically!
Clickout-Event monitors changes to the document,
and will ensure the out-events work no matter which dynamic
front-end framework you're using.

### Shadow DOM

Shadow DOM is supported as well,
so out-events work in Web Components and frameworks based on them (such as [Lit](https://lit.dev/)).
Clicking inside a shadow tree counts as clicking inside its shadow host and all of the host's ancestors,
and `event.relatedTarget` is retargeted following the native rules.

Note that this applies to open shadow roots only.
Also, inline out-event attributes (such as `onclickout="..."`) inside shadow trees are not detected automatically;
use `addEventListener()` or your framework's event binding syntax instead.

### Content Security Policy (CSP)

When using inline event attributes,
Clickout-Event is subject to the same CSP restriction as any other events;
that is, `'unsafe-inline'` must be allowed. Now Clickout-Event uses
native mechanisms instead of eval-like methods to parse the attribute,
so you don't need to allow `'unsafe-eval'`.

### Caveat

Since out-events are synthetic events,
they are untrusted (that is, `event.isTrusted == false`) by nature,
and your event listener is not supposed to reject the event because of this.