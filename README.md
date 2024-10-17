
<img width="300" alt="dommie-logo" src="https://github.com/user-attachments/assets/08182be5-2dd8-4990-85ae-53a766a232e1">

# Dommie
- Dynamic creation of HTML elements
- Component management with lifecycle hooks
- State and subscription handling
- Efficient DOM updates using DiffDOM

With Dommie, you can create snappy, performant UIs without the overhead of larger frameworks.

## Documentation
Please refer to the [Dommie Tutorial](https://dommie-docs.vercel.app/tutorial) for usage.

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
import app from "https://unpkg.com/dommie@3.0.9/build/min/app.js"
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

- [Dommie World Weather App](https://github.com/HatAndBread/dommie-weather-example) -- **A simple weather app built with Dommie and the OpenMeteo API.**
- [Breweries Of The World](https://github.com/HatAndBread/breweries-of-the-world) -- **A full-fledged SPA built with Dommie and the BreweryDB API.**

## Subscriptions
Dommie enables reactive UIs through a simple state and subscription model. When the state updates, subscribed elements re-render automatically.

```typescript
import app from "dommie";
import type { Template } from "dommie";

const hello = (h: Template) => {
  const { div, button, component } = h;

  return component(({ state }) => {
    const count = state(0);
    const updateCount = () => count.value++;

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

    const updateCount = () => count.value ++;
    const updateTitle = () => (title.value = "Hello Dommie!");

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
    const count = state(0);
    const updateCount = (_: Event, newNumber: number) => {
      count.value += newNumber;
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
    const updateCount = () => count.value++;

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
    const updateCatData = (data: string) => catData.value = data;

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
    const updateCount = () => count.value ++;
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
    const updateCount = () => count.value++;
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

## Step-by-Step Guide to SPA with Dommie

**1. Setting up Routes**

Dommie allows you to define multiple routes in your SPA using the router function. Routes are paths in the URL that map to specific components. The router takes an object where each key is a path and the value is a component to render.

Here’s an example:

```typescript
import app, { router } from "dommie";
import type { Template } from "dommie";

const Home = (h: Template) => {
  const { div, component } = h;
  return component(() => {
    div({ text: "Welcome to the Home page!" });
  });
};

const About = (h: Template) => {
  const { div, component } = h;
  return component(() => {
    div({ text: "This is the About page." });
  });
};
```

**2. Integrating the Router into the Main Component**
In your main app component, you call the router() function inside a component block. The router takes care of switching between components based on the current URL path.

```typescript
const App = (h: Template) => {
  const { div, component } = h;
  return component(() => {
    div(() => {
      router({
        "/": Home,    // When the path is '/', render the Home component
        "/about": About, // When the path is '/about', render the About component
      });
    });
  });
};

app(App, "#app", { spa: true });
```

**3. Navigating Between Pages**

To navigate between routes, Dommie provides the r object with a go function. You can use this to programmatically navigate between different pages without reloading the page.

Here’s an example of how you could add buttons to navigate between pages:

```typescript
const Home = (h: Template) => {
  const { div, button, component } = h;
  return component(({ r }) => {
    div({ text: "Welcome to the Home page!" });
    button({ text: "Go to About", click: () => r.go("/about") }); // Navigate to the About page
  });
};

const About = (h: Template) => {
  const { div, button, component } = h;
  return component(({ r }) => {
    div({ text: "This is the About page." });
    button({ text: "Go to Home", click: () => r.go("/") }); // Navigate back to the Home page
  });
};
```

**4. Enabling SPA Mode**

In the call to app(), the third argument is an options object where you can enable the SPA mode by setting spa: true. This tells Dommie to manage the URL changes internally without reloading the page.

```typescript
app(App, "#app", { spa: true });
```

**5. Wildcard Routes (Optional)**

You can define routes with dynamic segments using the * wildcard character. This allows matching paths like /blog/123/comments/456 where the numbers (or other path parts) can vary.

Here’s an example of using a wildcard route:

```typescript
const Blog = (h: Template) => {
  return h.component(({ r }) => {
    console.log(r.path.value);  // Full path, e.g. "/blog/123/comments/456"
    console.log(r.pathVariables.value); // Array of variables from the path, e.g. ["123", "456"]
    console.log(r.pathVariablesMap.value); // Object with named variables, e.g. { blog: "123", comment: "456" }
  });
};

router({
  "/": Home,
  "/about": About,
  "/blog/*": Blog, // This will match any path that starts with /blog/
});
```

### Key Points Recap:

* Router Setup: Use router() to define the mapping of URL paths to components.
*  Navigation: Use the r.go(path) function to change routes dynamically.
* SPA Mode: Enable SPA by passing { spa: true } to app(), which prevents full page reloads.
* Wildcard Routes: Use * in paths to capture dynamic parts of the URL.

## Get Involved

**Dommie** is open-source and welcomes contributions. If you find bugs or have ideas for improvements, feel free to [open an issue](https://github.com/hatandbread/dommie/issues) or submit a pull request.
