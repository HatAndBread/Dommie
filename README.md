# Dommie

A lightweight templating library that allows developers to build HTML elements dynamically, manage components with lifecycle hooks, handle subscriptions and state updates, and efficiently update the DOM using a virtual DOM diffing system powered by DiffDOM.

## Features

    Dynamic Element Creation: Easily create and manipulate HTML elements programmatically.
    Component System: Define components with lifecycle hooks like afterMount and afterDestroy.
    Subscriptions: Subscribe elements to functions or state changes and update them dynamically.
    Event Listeners: Add event listeners to elements, with automatic management of event handlers.
    Virtual DOM Diffing: Efficiently update the DOM using a diffing system to apply changes only when necessary.

## Installation

```bash
npm install dommie
```

## Usage
Basic Example

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

## Subscriptions

Subscribe an element to a function or a dynamic value:

```typescript
// Example here
```

## Event Listeners

You can easily attach event listeners to any element:

```typescript
// Example here
```

## Message Passing
In Dommie components can communicate with each other using a message passing system. This is useful when you want to update a component based on the state of another component.
Unlike many other libraries, in Dommie messages can be passed both ways, from parent to child and from child to parent.

```typescript
// ./components/parent.ts

```

```typescript
// ./components/child.ts

```

## License

This project is licensed under the MIT License.
