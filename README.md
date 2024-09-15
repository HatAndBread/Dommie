
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
  import type { Template } from "dommie";

  const myComponent = (h: Template) => {
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

Reactivity works by subscribing elements to state. When state is updated, all elements that are subscribed to the particular piece of state will be updated.
`state` is passed into your component as a parameter (along with other useful lifecycle hooks and functions), and is the only way to update the state of your component.
In the example below, the `div` element is subscribed to the `count` state, so it will be updated whenever the `update` method on count is called.

A `state` object is created by calling the `state` function with an initial value. The `state` object has a `value` property that holds the current value of the state, and an `update` method that can be called to update the state.

```typescript
import app from "dommie";
import type { Template } from "dommie";

const hello = (h: Template) => {
  const { div, button, component } = h;

  return component(({ state }) => {
    const count = state(0);
    const updateCount = () => count.update(count.value + 1);

    div(() => {
      div({ subscribe: count, text: () => count.value });
      button({ text: "Update Count", click: updateCount });
    });
  });
};
app(hello, "#app");
```

You can also subscribe to multiple states by passing an array of states to the `subscribe` property.

```typescript
import app from "dommie";
import type { Template } from "dommie";

const hello: Component = (h: Template) => {
  const { div, button, component } = h;
  return component(({ state }) => {
    const count = state(0);
    const title = state("Hello World!");

    const updateCount = () => count.update(count.value + 1);
    const updateTitle = () => title.update("Hello Dommie!");

    div({ subscribe: [count, title] }, () => {
      div({ text: () => count.value });
      div({ text: () => title.value });
    });

    button({ text: "Update Count", click: updateCount });
    button({ text: "Update Title", click: updateTitle });
  });
};

app(hello, "#app");
```

The first argument of an event listener function is always an event object. If you want to pass additional arguments, you can pass them as an array.

```typescript
import app from "dommie";
import type { Template } from "dommie";

const hello = (h: Template) => {
  const { div, button, component } = h;

  return component(({ state }) => {
    let count = state(0);
    const updateCount = (_: Event, newNumber: number) => {
      count += newNumber;
    };

    div(() => {
      div({ subscribe: count, text: () => count.value });
      button({ text: "Increment", click: [updateCount, [1]] });
      button({ text: "Decrement", click: [updateCount, [-1]] });
    });
  });
};

app(hello, "#app");
```

You can pass state to a child component, and unlike many other libraries, the child component is allowed to update the state of the parent component.

## Loops

You can use any iterable object in Dommie to create loops. This includes arrays, strings, and custom iterable objects.

```typescript
import app from "dommie";
import type { Template } from "dommie";

const hello = (h: Template) => {
  const { div, component } = h;
  const names = ["Alice", "Bob", "Charlie"];

  return component(() => {
    div(() => {
      for (const name of names) {
        div({ text: name });
      }
    });
  });
};

app(hello, "#app");
```

When loops refer to state, you MUST give the looped element a unique ID. This is because Dommie uses the id to keep track of the elements in the loop and update them efficiently.

```typescript
import app from "dommie";
import type { Template } from "dommie";

const hello = (h: Template) => {
  const { div, button, component } = h;
  const names = ["Alice", "Bob", "Charlie"];

  return component(({ state }) => {
    const count = state(0);
    const updateCount = () => count.update(count.value + 1);

    div(() => {
      div({ subscribe: count }, () => {
        for (const name of names) {
          div({ id: name, text: `${name}-${count.value}` });
        }
      });
      button({ text: "Update Count", click: updateCount });
    });
  });
};

app(hello, "#app");
```

## Lifecycle Hooks

### afterMounted

The `afterMounted` lifecycle hook is called after the component has been mounted to the DOM. This is useful for running code that requires the component to be mounted, such as fetching data from an API.

```typescript
import app from "dommie";
import type { Template } from "dommie";

const hello = (h: Template) => {
  const { div, component } = h;

  return component(({ afterMounted, state }) => {
    const catData = state<null | string>(null);
    const updateCatData = (data: string) => catData.update(data);

    afterMounted(async () => {
      const res = await fetch("https://meowfacts.herokuapp.com/");
      const data = await res.json();
      updateCatData(data.data[0]);
    });
    div({ text: () => catData.value || "Loading...", subscribe: catData });
  });
};

app(hello, "#app");
```

### afterDestroyed

The `afterDestroyed` lifecycle hook is called after the component has been removed from the DOM. This is useful for cleaning up resources, such as event listeners.

```typescript
import app from "dommie";
import type { Template} from "dommie";

const hello = (h: Template) => {
  const { div, component } = h;

  return component(({ state, afterDestroyed }) => {
    const count = state(0);
    const updateCount = () => count.update(count.value + 1);
    const interval = setInterval(updateCount, 1000);

    afterDestroyed(() => {
      clearInterval(interval);
    });

    div({ text: () => count.value, subscribe: count });
  });
};

app(hello, "#app");
```

## Side Effects
Use the `subscribe` function provided in your component to run side effects when a state changes. `subscribe` takes a callback function and an array of states. The callback function is called whenever the state changes.

```typescript
import app from "dommie";
import type { Template } from "dommie";

const hello = (h: Template) => {
  const { div, button, component } = h;

  return component(({ state, subscribe }) => {
    const count = state(0);
    const updateCount = () => count.update(count.value + 1);
    subscribe(() => {
      // This will run whenever the count changes
      console.log("Count has changed to", count.value);
    }, [count]);

    div({ subscribe: count, text: () => count.value });
    button({ text: "Increment", click: updateCount });
  });
};

app(hello, "#app");
```

## Refs

Refs are a way to access the underlying DOM element of a component. You can create a ref using the `ref` function and pass it to the `ref` property of an element. You can then access the DOM element using the ref function.

```typescript
import app from "dommie";
import type { Template } from "dommie";

const hello = (h: Template) => {
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

## Child Components

You can break up your components into smaller components and use them as children of other components. State can be passed down to child components, and child components can update the state of the parent component.

```typescript
// components/Hello.ts
import type { Template } from "dommie";

const Hello = (h: Template) => {
  const { div } = h;
  return div({ text: "Hello World!" });
};

export default Hello;
```

```typescript
// components/App.ts
import app from "dommie";
import type { Template } from "dommie";
import Hello from "./Hello";

const App = (h: Template) => {
  const { div, component } = h;
  return component(() => {
    div(() => {
      Hello(h);
    });
  });
};

app(App, "#app");
```
