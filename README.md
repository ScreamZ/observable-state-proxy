# Embedded : Observable state proxy

> [!IMPORTANT]
> This module is ESM only.

This module provides a proxy that can be used to observe changes to an object's properties. It's optimized for use with embedded systems, where memory is limited and performance is critical.

## Installation

```sh
npm install @embedded-js/observable-state-proxy
```

## Example usage

```ts
import {
  createObservableProxy,
  subscribeKey,
} from "@embedded-js/observable-state-proxy";

const stateObs = createObservableProxy({
  count: 0,
  name: "example",
});

const unsubscribe = subscribeKey(stateObs, "count", (newValue) => {
  console.log(`count changed to ${newValue}`);
});

stateObs.count = 1; // Console: count changed from 0 to 1
stateObs.name = "test"; // No console output

unsubscribe();

stateObs.count = 2; // No console output
```
