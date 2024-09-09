# Dommie

A lightweight templating library that allows developers to build HTML elements dynamically, manage components with lifecycle hooks, handle subscriptions and state updates, and efficiently update the DOM using a virtual DOM diffing system powered by DiffDOM.

## Why Dommie?
Dommie is designed for developers seeking a straightforward way to build reactive user interfaces without the overhead of larger frameworks. It’s perfect for small to medium-sized projects where simplicity and performance matter.

Dommie integrates easily with modern build systems such as Vite, Webpack, and Rollup. Simply import Dommie into your project and start building reactive components.

## Features

Write your UIs like this!

  ```typescript
  import app from "dommie";
  import type { Component } from "dommie";

  const myComponent: Component = (h) => {
    const { component, div, h1, text, a, br } = h;

    return component(() => {
      div({ style: { backgroundColor: "pink" }, text: "I am a div" }, () => {
        h1({ text: "I am an h1. I am a child of the div above." });
        text("I am a text node!");
        br();
        a({ href: "https://google.com", text: "I am a link to google" });
      });
    });
  };

  app(myComponent, "#app");
  ```

## Installation

```bash
npm install dommie
```

-- or --

```bash
yarn add dommie
```
etc.

## Subscriptions

Reactivity works by subscribing elements to `stateUpdater` functions. When `stateUpdater` functions are called, all elements that are subscribed to the particular function will be updated.
`stateUpdater` is passed into your component as a parameter (along with other useful lifecycle hooks and functions), and is the only way to update the state of your component.
In the example below, the `div` element is subscribed to the `updateCount` function, so it will be updated whenever `updateCount` is called.


```typescript
import app from "dommie";
import type { Component } from "dommie";

const hello: Component = (h) => {
  const { div, button } = h;
  let count = 0;

  return h.component(({ stateUpdater }) => {
    const updateCount = stateUpdater(() => count++);

    div(() => {
      div({ subscribe: updateCount, text: () => count });
      button({ text: "Update Count", click: updateCount });
    });
  });
};
app(hello, "#app");
```

You can also subscribe to multiple state updaters by passing an array of `stateUpdater` functions to the `subscribe` property.

```typescript
import app from "dommie";
import type { Component } from "dommie";

const hello: Component = (h) => {
  const { div, button } = h;
  let count = 0;
  let title = "Hello World!";

  return h.component(({ stateUpdater }) => {
    const updateCount = stateUpdater(() => count++);
    const updateTitle = stateUpdater(() => {
      title = "Hello Universe!";
    });

    div({ subscribe: [updateCount, updateTitle] }, () => {
      div({ text: () => count });
      div({ text: () => title });
      button({ text: "Update Count", click: updateCount });
      button({ text: "Update Title", click: updateTitle });
    });
  });
};

app(hello, "#app");
```

The first argument of a `stateUpdater` function is always an event object. If you want to pass additional arguments to the `stateUpdater` function, you can pass them as an array. The first element of the array will be the event object, and the rest of the elements will be the additional arguments.

```typescript
import app from "dommie";
import type { Component } from "dommie";

const hello: Component = (h) => {
  const { div, button } = h;
  let count = 0;

  return h.component(({ stateUpdater }) => {
    const updateCount = stateUpdater((_: Event, newNumber: number) => {
      count += newNumber;
    });

    div(() => {
      div({ subscribe: updateCount, text: () => count });
      button({ text: "Increment", click: [updateCount, [1]] });
      button({ text: "Decrement", click: [updateCount, [-1]] });
    });
  });
};

app(hello, "#app");
```

## Message Passing
In Dommie components can communicate with each other using a message passing system. This is useful when you want to update a component based on the state of another component.
Unlike many other libraries, in Dommie messages can be passed both ways, from parent to child and from child to parent.
The message-passing system allows for smooth inter-component communication, enabling parent-child interactions, even for deeply nested components, without the need for complex state management systems.

```typescript
// ./components/parent.ts
import app from "dommie";
import { child } from "./child";
import type { Component } from "dommie";

const hello: Component = (h) => {
  const { div, button } = h;
  let count = 0;

  return h.component(({ stateUpdater, send }) => {
    const updateCount = stateUpdater((_: Event, newNumber: number) => {
      count += newNumber;
      send("updateCount", count);
    });

    div(() => {
      button({ text: "Increment", click: [updateCount, [1]] });
      button({ text: "Decrement", click: [updateCount, [-1]] });
    });
    child(h, count);
  });
};

app(hello, "#app");

```

```typescript
// ./components/child.ts
import type { Component } from "dommie";

export const child: Component = (h, defaultValue: number) => {
  const { div } = h;
  let count = defaultValue;

  return h.component(({ on }) => {
    // Update the count when a message is received
    const updateCount = on(
      "updateCount",
      (newNumber: number) => (count = newNumber),
    );

    div(() => {
      div({ subscribe: updateCount, text: () => count });
    });
  });
};
```

## Lifecycle Hooks

### afterMounted

The `afterMounted` lifecycle hook is called after the component has been mounted to the DOM. This is useful for running code that requires the component to be mounted, such as fetching data from an API.

```typescript
import app from "dommie";
import type { Component } from "dommie";

const hello: Component = (h) => {
  const { div } = h;
  let catData: null | string = null;

  return h.component(({ afterMounted, stateUpdater }) => {
    const updateCatData = stateUpdater(
      (newData: string) => (catData = newData),
    );
    afterMounted(async () => {
      const res = await fetch("https://meowfacts.herokuapp.com/");
      const data = await res.json();
      updateCatData(data.data[0]);
    });
    div({ text: () => catData || "Loading...", subscribe: updateCatData });
  });
};

app(hello, "#app");
```

### afterDestroyed

The `afterDestroyed` lifecycle hook is called after the component has been removed from the DOM. This is useful for cleaning up resources, such as event listeners.

```typescript
import app from "dommie";
import type { Component } from "dommie";

const hello: Component = (h) => {
  const { div } = h;
  let count = 0;

  return h.component(({ stateUpdater, afterDestroyed }) => {
    const updatecount = stateUpdater(() => count++);
    const interval = setInterval(updatecount, 1000);

    afterDestroyed(() => {
      clearInterval(interval);
    });

    div({ text: () => count, subscribe: updatecount });
  });
};

app(hello, "#app");
```

## Refs

Refs are a way to access the underlying DOM element of a component. You can create a ref using the `ref` function and pass it to the `ref` property of an element. You can then access the DOM element using the ref function.

```typescript
import app from "dommie";
import type { Component } from "dommie";

const hello: Component = (h) => {
  return h.component(({ ref, afterMounted }) => {
    const inputRef = ref();

    // Focus on the input after it is mounted
    afterMounted(() => {
      inputRef()?.focus();
    });

    h.input({ ref: inputRef, type: "text" });
  });
};

app(hello, "#app");
```

## Basic Example

```typescript
import app from "dommie";
import type { Component } from "dommie";

const hello: Component = (h) => {
  // The dom elements you need are passed in to your component
  const { div, h1, text, button, p } = h;

  // Define the state
  let count = 0;
  let title = "Hello World!";

  const potentialTitles = ["Hello World!", "Hello Universe!", "Hello Galaxy!"];

  // Every component must return a component
  return h.component(({ stateUpdater }) => {
    // Define the state updaters
    const updateCount = stateUpdater((e: Event, newNumber: number) => {
      console.log(e); // This is the original click event
      count += newNumber;
    });
    const updateTitle = stateUpdater(() => {
      title =
        potentialTitles[Math.floor(Math.random() * potentialTitles.length)];
    });

    div(() => {
      h1({ subscribe: updateTitle }, () => {
        text(title);
      });
      button({ text: "Change the contents of the H1", click: updateTitle });
      // When you want to add arguments to the event handler, you can pass them as an array
      button({ text: "Increment", click: [updateCount, [1]] });
      button({ text: "Decrement", click: [updateCount, [-1]] });
      div({
        // This is how you can subscribe to the state
        subscribe: updateCount,
        // To access the state on a subscription (as opposed to nested within it), you must use a function
        text: () => `The count is currently ${count}`,
      });
      // You can subscribe to multiple state updaters
      p({ subscribe: [updateCount, updateTitle] }, () => {
        text(`The count is currently ${count} and the title is ${title}`);
      });
    });
  });
};

// Mount the app to the #app element
app(hello, "#app");

```

# Dommie API Documentation

## Overview

Dommie is a lightweight templating library designed for building dynamic and reactive user interfaces with ease. This documentation provides a detailed guide to Dommie’s API, covering its core features and usage patterns.

---

# Core Concepts

## Component

A **Component** in Dommie is a function that returns an HTML structure and manages its state, subscriptions, and lifecycle hooks. **Important**: Lifecycle hooks and state management utilities, such as `stateUpdater`, `afterMounted`, `afterDestroyed`, etc., are **passed as parameters** to the component function.

```typescript
import { Component } from "dommie";

const myComponent: Component = (h) => {
  // Define the DOM structure using helper functions like div, h1, etc.
  return h.component(({ stateUpdater, afterMounted }) => {
    h.div({ text: "Hello, Dommie!" });
  });
};
```

## Virtual DOM

Dommie updates the DOM efficiently using a virtual DOM diffing algorithm. You define the UI declaratively, and Dommie ensures that only necessary updates are made to the actual DOM.

## Core Functions

`app(component: Component, selector: string)`

Mounts a component to a DOM element.

* component: The component to mount.
* selector: A CSS selector for the target element.

```typescript
app(myComponent, "#app");
```

## State Management
`stateUpdater(fn: (...args: any[]) => void)`

`stateUpdater` is passed into your component as a parameter and creates a state update function that triggers a re-render for any elements subscribed to it. The function passed will update the state and return the new value.
`fn: A function that updates the state.`

```typescript
const myComponent: Component = (h) => {
  let count = 0;

  return h.component(({ stateUpdater }) => {
    const updateCount = stateUpdater((event, increment: number) => {
      count += increment;
    });

    h.div({ text: () => count, subscribe: updateCount });
    h.button({ text: "Increment", click: [updateCount, [1]] });
  });
};
```

## Subscriptions
`subscribe: stateUpdater | stateUpdater[]`

The `subscribe` property allows an element to re-render when the associated state updater function is called. `stateUpdater` is passed as a parameter to the component function, allowing you to manage which elements need to update when the state changes.

```typescript
h.div({ subscribe: updateCount, text: () => count });
```
### Subscribing to Multiple State Updaters

You can subscribe an element to multiple state updaters by passing an array:

```typescript
h.div({ subscribe: [updateCount, updateTitle] });
```

## Lifecycle Hooks
`afterMounted(fn: () => void)`

The `afterMounted` lifecycle hook is passed into your component function as a parameter and runs after the component is added to the DOM. This is useful for actions like fetching data or accessing DOM elements.

```typescript

h.component(({ afterMounted }) => {
  afterMounted(() => {
    console.log("Component mounted!");
  });
});
```

`afterDestroyed(fn: () => void)`

The `afterDestroyed` lifecycle hook is passed as a parameter to your component and runs after the component is removed from the DOM. Use this for cleanup, like removing event listeners or clearing intervals.

```typescript
h.component(({ afterDestroyed }) => {
  const interval = setInterval(() => { /* ... */ }, 1000);

  afterDestroyed(() => {
    clearInterval(interval);
  });
});
```

## Message Passing
`send(eventName: string, data?: any)`

Sends a message to another component. The target component must have a listener for the event. `send` is passed as a parameter to the component function, making message passing between components easy.

* eventName: The name of the event/message.
* data: Optional data to pass with the message.

```typescript
h.component(({ send }) => {
  send("updateCount", newCount);
});
```

`on(eventName: string, fn: (data: any) => void)`

Registers an event listener for receiving messages from other components. `on` is passed as a parameter to the component function, making it easy to set up event listeners.

* eventName: The event name to listen for.
* fn: A function to execute when the event is received.

```typescript
h.component(({ on }) => {
  on("updateCount", (newCount: number) => {
    count = newCount;
  });
});
```

## Ref System
`ref()`

Creates a reference to a DOM element that can be accessed programmatically. The `ref`` function is passed as a parameter to your component, enabling easy DOM manipulation.

```typescript
h.component(({ ref, afterMounted }) => {
  const inputRef = ref();

  afterMounted(() => {
    inputRef()?.focus();
  });

  h.input({ ref: inputRef, type: "text" });
});
```

---

## Basic Elements

Dommie provides helper functions for standard HTML elements (e.g., div, button, h1). These functions accept an object of attributes and an optional child function to define nested elements.
Common Attributes

* text: String or function returning text content.
* style: Object representing CSS styles.
* click: Event listener for click events, with optional argument passing.
* subscribe: Subscribes the element to one or more stateUpdater functions.
* ref: Associates the element with a reference for later access.

```typescript
h.div({ style: { color: "red" }, text: "Hello" });
h.button({ text: "Click Me", click: myClickHandler });
```

---

## Event Handling
You can handle DOM events using event listeners. The most common is the click event, but other events (e.g., input, change, etc.) can also be handled.

Some possible DOM events:
```
abort 	The loading of a media is aborted 	UiEvent, Event
afterprint 	A page has started printing 	Event
animationend 	A CSS animation has completed 	AnimationEvent
animationiteration 	A CSS animation is repeated 	AnimationEvent
animationstart 	A CSS animation has started 	AnimationEvent
beforeprint 	A page is about to be printed 	Event
beforeunload 	Before a document is about to be unloaded 	UiEvent, Event
blur 	An element loses focus 	FocusEvent
canplay 	The browser can start playing a media (has buffered enough to begin) 	Event
canplaythrough 	The browser can play through a media without stopping for buffering 	Event
change 	The content of a form element has changed 	Event
click 	An element is clicked on 	MouseEvent
contextmenu 	An element is right-clicked to open a context menu 	MouseEvent
copy 	The content of an element is copied 	ClipboardEvent
cut 	The content of an element is cut 	ClipboardEvent
dblclick 	An element is double-clicked 	MouseEvent
drag 	An element is being dragged 	DragEvent
dragend 	Dragging of an element has ended 	DragEvent
dragenter 	A dragged element enters the drop target 	DragEvent
dragleave 	A dragged element leaves the drop target 	DragEvent
dragover 	A dragged element is over the drop target 	DragEvent
dragstart 	Dragging of an element has started 	DragEvent
drop 	A dragged element is dropped on the target 	DragEvent
durationchange 	The duration of a media is changed 	Event
ended 	A media has reach the end ("thanks for listening") 	Event
error 	An error has occurred while loading a file 	ProgressEvent, UiEvent, Event
focus 	An element gets focus 	FocusEvent
focusin 	An element is about to get focus 	FocusEvent
focusout 	An element is about to lose focus 	FocusEvent
fullscreenchange 	An element is displayed in fullscreen mode 	Event
fullscreenerror 	An element can not be displayed in fullscreen mode 	Event
hashchange 	There has been changes to the anchor part of a URL 	HashChangeEvent
input 	An element gets user input 	InputEvent, Event
invalid 	An element is invalid 	Event
keydown 	A key is down 	KeyboardEvent
keypress 	A key is pressed 	KeyboardEvent
keyup 	A key is released 	KeyboardEvent
load 	An object has loaded 	UiEvent, Event
loadeddata 	Media data is loaded 	Event
loadedmetadata 	Meta data (like dimensions and duration) are loaded 	Event
loadstart 	The browser starts looking for the specified media 	ProgressEvent
message 	A message is received through the event source 	Event
mousedown 	The mouse button is pressed over an element 	MouseEvent
mouseenter 	The pointer is moved onto an element 	MouseEvent
mouseleave 	The pointer is moved out of an element 	MouseEvent
mousemove 	The pointer is moved over an element 	MouseEvent
mouseover 	The pointer is moved onto an element 	MouseEvent
mouseout 	The pointer is moved out of an element 	MouseEvent
mouseup 	A user releases a mouse button over an element 	MouseEvent
mousewheel 	Deprecated. Use the wheel event instead 	WheelEvent
offline 	The browser starts working offline 	Event
online 	The browser starts working online 	Event
open 	A connection with the event source is opened 	Event
pagehide 	User navigates away from a webpage 	PageTransitionEvent
pageshow 	User navigates to a webpage 	PageTransitionEvent
paste 	Some content is pasted in an element 	ClipboardEvent
pause 	A media is paused 	Event
play 	The media has started or is no longer paused 	Event
playing 	The media is playing after being paused or buffered 	Event
popstate 	The window's history changes 	PopStateEvent
progress 	The browser is downloading media data 	Event
ratechange 	The playing speed of a media is changed 	Event
resize 	The document view is resized 	UiEvent, Event
reset 	A form is reset 	Event
scroll 	An scrollbar is being scrolled 	UiEvent, Event
search 	Something is written in a search field 	Event
seeked 	Skipping to a media position is finished 	Event
seeking 	Skipping to a media position is started 	Event
select 	User selects some text 	UiEvent, Event
show 	A <menu> element is shown as a context menu 	Event
stalled 	The browser is trying to get unavailable media data 	Event
storage 	A Web Storage area is updated 	StorageEvent
submit 	A form is submitted 	Event
suspend 	The browser is intentionally not getting media data 	Event
timeupdate 	The playing position has changed (the user moves to a different point in the media) 	Event
toggle 	The user opens or closes the <details> element 	Event
touchcancel 	The touch is interrupted 	TouchEvent
touchend 	A finger is removed from a touch screen 	TouchEvent
touchmove 	A finger is dragged across the screen 	TouchEvent
touchstart 	A finger is placed on a touch screen 	TouchEvent
transitionend 	A CSS transition has completed 	TransitionEvent
unload 	A page has unloaded 	UiEvent, Event
volumechange 	The volume of a media is changed (includes muting) 	Event
waiting 	A media is paused but is expected to resume (e.g. buffering) 	Event
wheel 	The mouse wheel rolls up or down over an element 	WheelEvent
```

## License

This project is licensed under the MIT License.
