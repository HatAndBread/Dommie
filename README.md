
<img width="758" alt="dommie-logo" src="https://github.com/user-attachments/assets/8862c679-b865-4b5c-a4b5-aa2110268a88">

# Dommie

A lightweight templating library that allows developers to build HTML elements dynamically, manage components with lifecycle hooks, handle subscriptions and state updates, and efficiently update the DOM using a virtual DOM diffing system powered by [DiffDOM](https://github.com/fiduswriter/diffDOM).

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

You can create a custom (non-standard) HTML element using the `h.custom` function. The options object must include a `nodeName` property.

```typescript
h.custom({ text: "Hello", nodeName: "my-element" }, () => {
  h.comment("This is a custom element");
});
// Output: <my-element>Hello<!-- This is a custom element --></my-element>
```

---

## Event Handling
You can handle DOM events using event listeners. Any valid DOM event can be used as a property on an element, with the value being a `stateUpdater` function to execute when the event occurs.

```typescript
let text = ""
h.component(({ stateUpdater }) => {
  const updateText = stateUpdater((event) => {
    text = event.target.value;
  });

  h1({ text: () => text, subscribe: updateText }});
  h.input({ type: "text", change: updateText});
});
```

A complete list of possible events:
```
abort
afterprint
animationend
animationiteration
animationstart
beforeprint
beforeunload
blur
canplay
canplaythrough
change
click
contextmenu
copy
cut
dblclick
drag
dragend
dragenter
dragleave
dragover
dragstart
drop
durationchange
ended
error
focus
focusin
focusout
fullscreenchange
fullscreenerror
hashchange
input
invalid
keydown
keypress
keyup
load
loadeddata
loadedmetadata
loadstart
message
mousedown
mouseenter
mouseleave
mousemove
mouseover
mouseout
mouseup
mousewheel
offline
online
open
pagehide
pageshow
paste
pause
play
playing
popstate
progress
ratechange
resize
reset
scroll
search
seeked
seeking
select
show
stalled
storage
submit
suspend
timeupdate
toggle
touchcancel
touchend
touchmove
touchstart
transitionend
unload
volumechange
waiting
wheel
```

## License

This project is licensed under the MIT License.
