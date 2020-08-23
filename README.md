# Clickout-Event

> Provides universal support for `clickout` and other similar events to webpages.

[![npm version](https://img.shields.io/npm/v/click-event.svg?logo=npm)](https://www.npmjs.com/package/clickout-event)
![npm downloads](https://img.shields.io/npm/dt/clickout-event?logo=npm)
[![GitHub package version](https://img.shields.io/github/package-json/v/MuTsunTsai/clickout-event.svg?logo=github&label=Github)](https://github.com/MuTsunTsai/clickout-event)
![license](https://img.shields.io/npm/l/clickout-event.svg)


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

## Install

You can get Clickout-Event as an NPM package by running:
```bash
npm install clickout-event --save
```
Or, simply download [`clickout-event.js`](https://github.com/MuTsunTsai/clickout-event/raw/master/dist/clickout-event.js).
Then all you need to do is add the script tag anywhere (as long as it is before any calling of the `addEventListener` method) in your webpage :

```html
<script src="clickout-event.js"></script>
```

And watch the magic happen.

## API

Clickout-Event provides the corresponding "out-events" for the following events: `click`, `dblclick`, `mousedown`, `mouseup`, `touchstart` and `touchend`. The corresponding events are then called `clickout`, `dblclickout` etc. You can then use them the same way you use any other events, such as:

### HTML attribute

```html
<div onclickout="console.log('clickout detected')">...</div>
```

### Vanilla JavaScript

```js
document.getElementById('myId').addEventListener('clickout', myListener);
```

### jQuery

```js
$('#myId').on('clickout', myListener);
```

### Vue.js

```html
<div v-on:clickout="open=false">...</div>
```

### Event propagation

You can have nested elements using the out-events. In that case,
unlike regular events, out-events fire in the top-down ordering;
that is, the parent element will fire the event first,
and then will the child elements.
Similarly, when calling `event.stopPropagation()`
(or, for example, using `v-on:clickout.stop` in Vue.js),
it will be the parent element stopping the child element from firing the event.

### Dynamic elements

Feel free to add or remove elements dynamically!
Clickout-Event monitors changes to the document,
and will ensure the out-events works no matter which dynamic
front-end framework you're using.