<div align="center">

[![npm version](https://badge.fury.io/js/syncrostate.svg)](https://badge.fury.io/js/syncrostate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Svelte v5](https://img.shields.io/badge/Svelte-v5-FF3E00.svg)](https://svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Bundle size](https://deno.bundlejs.com/badge?q=syncrostate@latest&config=%7B%22esbuild%22:%7B%22external%22:%5B%22svelte%22,%22clsx%22%5D%7D%7D)](https://deno.bundlejs.com/badge?q=syncrostate@latest&config=%7B%22esbuild%22:%7B%22external%22:%5B%22svelte%22,%22clsx%22%5D%7D%7D)

</div>

# SyncroState

SyncroState brings Svelte 5 reactivity to the multiplayer level. Built on top of Yjs, it provides a reactive and type-safe way to build multiplayer experiences.

Inspired by [Syncedstore](https://github.com/yousefed/SyncedStore), SyncroState modernizes collaborative state management by leveraging new Svelte 5's reactivity system. It provides a natural way to work with synchronized state that feels just like a regular Svelte $state.

> ⚠️ The demo uses a public Liveblocks API key which may become rate-limited. I recommend using your own API key for thorough testing.

## Features

- 🚀 **Powered by Yjs** - Industry-leading CRDT for conflict-free real-time collaboration
- 🔒 **Type-Safe** - Full TypeScript support with rich type inference and schema validation
- 💫 **Svelte DX** - Works like regular Svelte state with fine-grained reactivity and simple mutations
- 🎯 **Rich Data Types** - Support for primitives, arrays, objects, dates, enums, and sets.
- 🔌 **Provider Agnostic** - Works with Liveblocks, PartyKit, or any Yjs provider
- 📚 **Local Persistence ready** - Support for y-indexeddb for offline use
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

Once created, you can use the state like a regular Svelte state: mutate it, bind it, use mutative methods, etc.

```svelte
<script>
	import { syncroState, y } from 'syncrostate';
	import { LiveblocksYjsProvider } from '@liveblocks/yjs';
	import { createClient } from '@liveblocks/client';

	const document = syncroState({
		// Optional but required for remote sync: Connect and sync to a yjs provider
		// If omitted, state will be local-only and in memory.
		sync: ({ doc, synced }) => {
			const client = createClient({
				publicApiKey: 'your-api-key'
			});
			const { room } = client.enterRoom('room-id');
			const provider = new LiveblocksYjsProvider(room, doc);
			provider.on('synced', () => {
				synced();
			});
		},

		// Define your state schema. It must be an object
		schema: {
			// Primitive values
			name: y.string(),
			age: y.number(),
			isOnline: y.boolean(),
			lastSeen: y.date(),
			theme: y.enum(['light', 'dark']),

			// Nested objects
			preferences: y.object({
				theme: y.enum(['light', 'dark']),
				notifications: y.boolean()
			}),

			// Arrays of any type
			todos: y.array(y.object({
				title: y.string(),
				completed: y.boolean()
			})),

			// Sets of any primitive type
			colors: y.set(y.string()),

      // Discriminated union
      user: y.discriminatedUnion("role", [
        y.object({
          // Literal value
          role: y.literal("admin"),
          permissions: y.array(y.string()),
          canDeleteUsers: y.boolean(),
        }),
        y.object({
          role: y.literal("user"),
          permissions: y.array(y.string()),
        }),
        y.object({
          role: y.literal("guest"),
          expiresAt: y.date(),
        }),
      ]),
		}
	});
</script>

<!-- Use it like regular Svelte state -->
<input bind:value={document.name} />
<button onclick={() => document.todos.push({ title: 'New todo', completed: false })}>
	Add Todo
</button>
```

## How it works

SyncroState combines the power of Svelte's reactivity system with Yjs's CRDT capabilities to create a seamless real-time collaborative state management solution. Here's how it works under the hood:

### Local State Management

1. **Proxy-based State Tree**: When you create a state using `syncroState()`, it builds a tree of proxy objects that mirror your schema structure. Each property (primitive or nested) is wrapped in a specialized proxy that leverages Svelte's reactivity through `$state` or specialized proxy like `SvelteDate` or `SvelteSet` and soon `SvelteMap`.
2. **Mutation Trapping**: These proxies intercept all state mutations (assignments, mutative operations, object modifications, reassignments). This allows SyncroState to:

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
   - For collections, the corresponding Y.Array or Y.Map is updated.
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

### Adding persistence and remote provider

To add a persistence provider like y-indexeddb and use a remote provider like Liveblocks or y-websocket you will do something like this:

```ts
import { IndexeddbPersistence } from "y-indexeddb";
import { createClient } from "@liveblocks/client";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";

const document = syncroState({
  sync: ({ doc, synced }) => {
    const docName = "your-doc-name";
    const localProvider = new IndexeddbPersistence(docName, doc);
    const remoteClient = createClient({
      publicApiKey: "your-api-key",
    });
    const { room } = remoteClient.enterRoom(docName);
    localProvider.on("synced", () => {
      const remoteProvider = new LiveblocksYjsProvider(room, doc);
      remoteProvider.on("synced", () => {
        synced();
      });
    });
  },
  // ... your schema
});
```

### Waiting for the state to be synced

When you are using a remote provider, you might want to wait for the state to be synced before doing something.
The syncrostate object has a `getState()` methods that return the state of the syncronisation from which you can get the `synced` property to check if the state is synced.

```svelte
{#if document.getState?.().synced}
	<div>My name is {document.name}</div>
{/if}
```

### Editing multiple object properties at once

If you want to edit multiple object properties at once it's preferable to reassign the entire object.
This way, syncrostate can apply the changes inside a single transaction and avoid partial updates.
Only the properties that are being changed will trigger reactivity and remote updates.

```js
// Instead of this
state.user.name = "John";
state.user.age = 30;

// Do this
state.user = {
  ...state.user,
  name: "John",
  age: 30,
};
```

### Accessing the underlying Yjs document and shared types

Every syncrostate object or array has three additional methods: `getState`, `getYTypes` and `getYTypes`.

- `getState` returns the state `type State` of the syncronisation.
- `getYTypes` returns the underlying YObject or YArray.
- `getYTypes` returns the YJS types children of the YObject or YArray.

```ts
type State {
  synced: boolean;
  awareness: Awareness;
  doc: Y.Doc;
  undoManager: Y.UndoManager;
  transaction: (fn: () => void) => void;
  transactionKey: any;
  undo: () => void;
  redo: () => void;
}
```

### Undo/Redo

SyncroState uses Yjs's undo/redo system to provide undo/redo functionality. These methods are available through the `getState` method.

## Roadmap

- [ ] Find a way to make syncrostate schema optional,
- [ ] Add support for recursive types
- [ ] Add support for nested documents
- [ ] Add a simple way to manage awareness sharing

## License

SyncroState is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
