# Introducing Dommie: A Lightweight Templating Library with Intuitive Syntax for Dynamic Web Apps

Let's be honest: the world doesn't really need another JavaScript framework. But I built one anyway, out of curiosity. I wanted to see if I could create something lighter, simpler, and more intuitive than the big players in the web development world. To my surprise, I liked the results—so much so that I turned my experiment into a fully functional library: Dommie.
Why Dommie?

Frameworks like React, Vue, and Angular have reshaped how we approach modern web development. They're powerful, feature-rich, and designed to handle large, complex applications. If you're building something huge, they're exactly what you need. Their extensive ecosystems provide every tool imaginable for state management, routing, and performance optimization.

But what about when you don't need all that power?

That's where Dommie comes in. Built out of curiosity and a desire to simplify things, Dommie is a lightweight alternative that focuses on providing the essentials: a clean, intuitive templating syntax and an easy way to build dynamic UIs. It skips the steep learning curves, setup, and complexity that come with larger frameworks and gets straight to the point: building fast, reactive components with minimal overhead.

---

## What Makes Dommie Special?
1. Intuitive Templating Syntax

One of the best things about Dommie is its clean and intuitive syntax for building HTML. Unlike React's JSX or Vue's template syntax, Dommie keeps things simple by allowing you to define your HTML structure directly in JavaScript with minimal boilerplate.

Here's a quick example:

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

With Dommie, you don't need to learn a custom templating language—just use pure JavaScript. This makes it easier to keep your logic and structure together without switching between contexts.

2. Lightweight Yet Powerful

Dommie is minimal by design. It doesn't come with a bunch of features you might never use. Instead, it gives you just enough to get the job done: dynamic element creation, component lifecycle management, and efficient DOM updates. It's perfect for small-to-medium projects or when you just want more control without unnecessary complexity.

3. Efficient DOM Updates with Virtual DOM Diffing

Like the bigger frameworks, Dommie ensures smooth and efficient rendering. It uses virtual DOM diffing powered by DiffDOM, so only the parts of the DOM that need updating get changed. This keeps your app fast and responsive, even as your UI becomes more dynamic.

4. Lifecycle Hooks for Complete Control

With Dommie, you can take full control over your components using lifecycle hooks. Whether it's initializing data or cleaning up after a component is destroyed, Dommie gives you the tools to manage your components with precision.

5. Subscriber-Based State System

Unlike full-blown reactivity systems in larger frameworks, Dommie employs a subscriber-based system for managing state and updating the UI. Instead of tracking every state change with reactive properties, you can explicitly subscribe components to specific state updates. When a subscribed state variable changes, the affected components are updated automatically.

This approach keeps things lightweight and explicit, ensuring that only the parts of your app that truly need to react to changes do so. You have control over which parts of your state trigger updates, without the overhead of reactivity systems that track every single property change.

Here's an example of subscribing a component to state changes:

```typescript
import app from "dommie";
import type { Component } from "dommie";

const myComponent: Component = (h) => {
  const { component, div, button } = h;
  let count = 0;

  return component(({ stateUpdater }) => {
    const updateCount = stateUpdater(() => count++);

    div(() => {
      div({ subscribe: updateCount, text: () => count });
      button({ text: "Update Count", click: updateCount });
    });
  });
};
app(myComponent, "#app");
```

In this case, when the `updateCount` function is executed on the button click, only the subscribed counterComponent is updated, keeping the system efficient and focused.
## Why Choose Dommie?

Dommie is perfect for scenarios where a larger framework might be overkill:

    Micro Frontends: Its small footprint makes Dommie ideal for embedding in larger applications.
    Simple Web Applications: Dommie gives you the tools you need to build straightforward, dynamic apps without the bloat.
    Widget and Plugin Development: Building small, interactive widgets is easy with Dommie's lightweight approach.
    Prototyping: Its intuitive syntax and fast setup make Dommie a great option for quickly prototyping ideas without the baggage of a larger framework.

## Conclusion

While React, Vue, and Angular are fantastic tools for large, complex projects, sometimes you need something simpler. That's why I built Dommie—to offer a lightweight alternative with a focus on intuitive templating, efficient performance, and a subscriber-based state system. It might not be the largest framework, but it gets the job done with minimal fuss, making it a great tool for smaller projects, widgets, and anyone looking to simplify their development workflow.

If you're curious to try something new, give Dommie a shot. It was built out of curiosity—and who knows? You might like the results too.

This version explains how Dommie uses a "subscriber" system to manage state updates rather than full reactivity, emphasizing how this keeps things lightweight and explicit. Let me know how it feels!
