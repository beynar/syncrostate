# SyncroState

SyncroState brings Svelte 5 reactivity to the multiplayer level. Built on top of Yjs, it provides a reactive and type-safe way to build multiplayer offline experiences.

Inspired by [Syncedstore](https://github.com/yousefed/SyncedStore), SyncroState modernizes the approach with Svelte 5's powerful reactivity system to create a more flexible and intuitive developer experience.

## Features

- 🚀 **Powered by Yjs** - Industry-leading CRDT for conflict-free real-time collaboration
- 🔒 **Type-Safe** - Full TypeScript support with rich type inference
- 💫 **Svelte Native** - Works like regular Svelte state with fine-grained reactivity
- 🎯 **Rich Data Types** - Support for primitives, arrays, objects, dates, enums, and more
- 🔌 **Provider Agnostic** - Works with Liveblocks, PartyKit, or any Yjs provider
- ↩️ **Undo/Redo** - Built-in support for state history
- 🎮 **Bindable** - Use `bind:value` like you would with any Svelte state
- 🎨 **Optional & Nullable** - Flexible schema definition with optional and nullable fields

## Installation

```bash
# Using pnpm
pnpm add syncrostate

# Using bun
bun add syncrostate

# Using npm
npm install syncrostate
```

## Quick Start

SyncroState uses a schema-first approach to define your collaborative state. Here's a simple example:

The schema defines both the structure and the types of your state. Every field is automatically:

- Type-safe with TypeScript
- Reactive with Svelte
- Synchronized across clients
- Validated against the schema

Once created, you can use the state like a regular Svelte state: mutate it, bind it, use mutative array methods, etc.

```svelte
<script>
	import { syncroState, y } from 'syncrostate';
	import { LiveblocksYjsProvider } from '@liveblocks/yjs';
	import { createClient } from '@liveblocks/client';

	const state = syncroState({
		// Optional: Connect to a real-time provider
		// If omitted, state will be local-only during development
		connect: () => {
			const client = createClient({
				publicApiKey: 'your-api-key'
			});

			return new Promise((resolve) => {
				const { room } = client.enterRoom('room-id');
				const provider = new LiveblocksYjsProvider(room, doc);
				provider.on('synced', resolve);
			});
		},

		// Define your state schema
		schema: {
			// Primitive values
			name: y.string(),
			age: y.number(),
			isOnline: y.boolean(),
			lastSeen: y.date(),

			// Nested objects
			preferences: y.object({
				theme: y.enum(['light', 'dark']),
				notifications: y.boolean()
			}),

			// Arrays of any type
			todos: y.array(y.object({
				title: y.string(),
				completed: y.boolean()
			}))
		}
	});
</script>

<!-- Use it like regular Svelte state -->
<input bind:value={state.name} />
<button on:click={() => state.todos.push({ title: 'New todo', completed: false })}>
	Add Todo
</button>
```

## How it works

SyncroState combines the power of Svelte's reactivity system with Yjs's CRDT capabilities to create a seamless real-time collaborative state management solution. Here's how it works under the hood:

### Local State Management

1. **Proxy-based State Tree**: When you create a state using `syncroState()`, it builds a tree of proxy objects that mirror your schema structure. Each property (primitive or nested) is wrapped in a specialized proxy that leverages Svelte's `$state` for reactivity.

2. **Mutation Trapping**: These proxies intercept all state mutations (assignments, array operations, object modifications) using JavaScript's Proxy API. This allows SyncroState to:
   - Validate changes against the schema
   - Update the local Svelte state immediately for responsive UI updates
   - Forward changes to the underlying Yjs document

### Synchronization Layer

1. **Yjs Integration**: The state is backed by Yjs types in the following way:

   - Primitive values (numbers, booleans, dates, enums) are stored using Y.Text
   - Arrays are stored using Y.Array
   - Objects are stored using Y.Map

   When you modify the state:

   - The change is wrapped in a Yjs transaction
   - For primitives, the value is serialized and stored in the Y.Text
   - For collections, the corresponding Y.Array or Y.Map is updated
   - Yjs handles conflict resolution and ensures eventual consistency

2. **Remote Updates**: When changes come in from other clients:
   - Yjs observer callbacks are triggered
   - The proxies update their internal Svelte state
   - Svelte's reactivity system automatically updates any UI components using that state

### Type Safety and Validation

- The schema you define isn't just for TypeScript types - it creates specialized proxies that understand how to handle each type of data
- Nested objects and arrays create nested proxy structures that maintain reactivity at every level
- All mutations are validated against the schema before being applied

This architecture ensures that:

- Local changes feel instant and responsive
- All clients converge to the same state
- The state remains type-safe and valid
- You get Svelte's fine-grained reactivity for optimal performance

## Things to notice

### Editing multiple object properties at once

If you want to edit multiple object properties at once it's preferable to reassign the entire object.
This way, syncrostate can apply the changes inside a single transaction and avoid partial updates.
Only the properties that are being changed will trigger reactivity and remote updates.

```js
// Instead of
state.user.name = "John";
state.user.age = 30;

// Good
state.user = {
  ...state.user,
  name: "John",
  age: 30
};
```

### Waiting for the state to be synced

When you are using a remote provider, you might want to wait for the state to be synced before doing something.
The syncrostate object has a `$state.remotlySynced` property that you can use to wait for the state to be synced.

```svelte
{#if synced.$state.remotlySynced}
	<div>My name is {synced.name}</div>
{/if}
```

### Accessing the underlying Yjs document and shared types

Every syncrostate object or array has a `$state` property of the following type:

```ts
type State<T extends "object" | "array"> {
  remotlySynced: boolean;
  locallySynced: boolean;
  connectionStatus: "CONNECTED" | "DISCONNECTED" | "CONNECTING";
  awareness: Awareness;
  doc: Y.Doc;
  undoManager: Y.UndoManager;
  transaction: (fn: () => void) => void;
  transactionKey: any;
  sharedType: Y.Map<any>;
  sharedTypes: T extends "object" ? Record<string, Y.AbstractType<any>> : Y.AbstractType<any>[];
  undo: () => void;
  redo: () => void;
}
```

You can access the current object or array share type using the `$state.sharedType` property and its shared types children using the `$state.sharedTypes` property.

### Undo/Redo

SyncroState uses Yjs's undo/redo system to provide undo/redo functionality. These methods are available on the `$state` property.

## Roadmap

- [ ] Add support for Set and Map types
- [ ] Find a way to make syncrostate schema optional
- [ ] Add support for recursive types
- [ ] Add support for nested documents
