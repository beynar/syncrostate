# SyncroState

SyncroState is a library that brings Svelte reactivity to the multiplayer level.
It's built on top of Yjs, and leverages Svelte reactivity to make the collaborative state reactive, easy to use and performant.

It takes the ideas of [Syncedstore](https://github.com/yousefed/SyncedStore) to modernize it and make it more flexible and svelte-5 friendly.

## Features

- Yjs under the hood (known for its performance)
- Typesafe and typerich (supports arrays, booleans, objects, enums, numbers, strings, dates, nullable and optionnal)
- Works like a normal Svelte state that you can mutate
- Fine grained reactivity (thanks to Svelte ❤️)
- Bindable (because we love to bind:value)
- Pluggable (works with Liveblocks, but can be used with other real-time collaboration libraries like PartyKit)
- Undo/Redo

## Installation

```bash
pnpm add syncrostate
```

```bash
bun add syncrostate
```

```bash
npm install syncrostate
```

## Usage

To use SyncroState, you need to use the `createSyncroState` function.
It takes a configuration object with a `schema` and a `connect` function.

The schema will define the structure of your state.

The connect function is used to connect to the Yjs provider of your choice.
We use Liveblocks as an example provider, but you can use any other Yjs provider.

During development, you can omit the connect function and the state will be created in memory.

```svelte
<script>
	import { syncroState, y } from 'syncrostate';
	import { LiveblocksYjsProvider } from '@liveblocks/yjs';
	import { createClient } from '@liveblocks/client';

	const state = syncroState({
		connect: () => {
			return new Promise((resolve, reject) => {
				const client = createClient({
					publicApiKey: ''
				});
				const { room } = client.enterRoom('your-room-id');
				return new Promise((resolve, reject) => {
					const yProvider = new LiveblocksYjsProvider(room, doc);
					yProvider.on('synced', () => {
						resolve();
					});
				});
			});
		},
		schema: {
			name: y.string(),
			hobbies: y.array(y.string()),
			age: y.number(),
			birthday: y.date(),
			isAdmin: y.boolean(),
			settings: y.object({
				theme: y.enum(['light', 'dark'])
			}),
			friends: y.array(y.object({ name: y.string(), age: y.number() }))
		}
	});
</script>
```

<!-- You can then use the state like a normal Svelte state -->
<input bind:value={state.name} />
