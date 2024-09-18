
<img width="758" alt="dommie-logo" src="https://github.com/user-attachments/assets/8862c679-b865-4b5c-a4b5-aa2110268a88">

# Dommie

**Dommie** is a lightweight templating library for building dynamic, reactive user interfaces. It offers:

- Dynamic creation of HTML elements
- Component management with lifecycle hooks
- State and subscription handling
- Efficient DOM updates using DiffDOM

With Dommie, you can create snappy, performant UIs without the overhead of larger frameworks.

## Why Dommie?
Dommie is designed for developers who need a simple yet powerful way to build reactive UIs. It's a great fit for small to medium projects where simplicity, flexibility, and performance are key.

### Key Benefits:

- Simple API: Minimalistic and intuitive for quick integration.
- Flexible: Works seamlessly with modern build tools like Vite, Webpack, and Rollup.
- Performant: Dommie's state subscription model ensures only necessary updates are made to the DOM.

## Installation

```bash
npm install dommie
```

-- or --

```bash
yarn add dommie
```

-- or --

```javascript
import app from "https://unpkg.com/dommie@2.2.1/build/min/app.js"
// Or use a script tag in your HTML file. Check the latest version on unpkg.com
```
etc.

## Quick Start

Here’s a simple example of how to use Dommie to build a component:

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

## Example Apps

The easiest way to learn Dommie is to look at some example apps. Here are a few examples to get you started:

- [Dommie World Weather App](https://github.com/HatAndBread/dommie-weather-example)

## Subscriptions
Dommie enables reactive UIs through a simple state and subscription model. When the state updates, subscribed elements re-render automatically.

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

You can also subscribe multiple elements to different states, ensuring your UI stays in sync.

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

Dommie supports loops with any iterable, making it easy to dynamically generate lists of elements.

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

When using loops with dynamic state, don’t forget to assign unique IDs for efficient updates.

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

Dommie allows you to break your UI into smaller components, which can pass and update state between parent and child components.

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

## Single Page Applications

Dommie can be used to build single-page applications (SPAs) by using the `router` function to define routes and components.
The `r` object passed to the component contains the `go` function, which can be used to navigate to a different route.

```typescript
import app, { router } from "dommie";
import type { Template } from "dommie";

const Home = (h: Template) => {
  const { component, div, button } = h;
  return component(({r}) => {
    div({ text: "Home" }, () => {
      button({ text: "Go to About", click: () => r.go("/about") });
    });
  });
};

const About = (h: Template) => {
  const { component, div } = h;
  return component(() => {
    div({ text: "About" });
  });
};

const App = (h: Template) => {
  const { div, component } = h;
  return component(({r}) => {
    div(() => {
      router({
        "/": Home,
        "/about": About,
      });
    });
  });
};

app(App, "#app");
```

### Wildcard Routes

You can use wildcard routes by using the `*` character in the route path. This will match any route that starts with the specified path.

```typescript
router({
  "/": Home,
  "/about": About,
  "/blog/*": Blog,
});
```

## Get Involved

**Dommie** is open-source and welcomes contributions. If you find bugs or have ideas for improvements, feel free to [open an issue](https://github.com/hatandbread/dommie/issues) or submit a pull request.
