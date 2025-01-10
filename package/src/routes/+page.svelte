<script lang="ts">
	import { syncroState } from '$lib/proxys/syncroState.svelte.js';
	import { y } from '$lib/schemas/schema.js';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github-dark.css';
	import javascript from 'highlight.js/lib/languages/json';
	import { LiveblocksYjsProvider } from '@liveblocks/yjs';
	import { createClient } from '@liveblocks/client';
	import { onMount } from 'svelte';
	hljs.registerLanguage('javascript', javascript);

	const highlight = (node: HTMLElement, json: string) => {
		const highlighted = hljs.highlight(json, { language: 'json' }).value;
		node.innerHTML = highlighted;
	};

	const client = createClient({
		publicApiKey: 'pk_prod_ytItHgLSil9pFkJELGPI7yWptk_jNMifKfv3JhWODRGX2vK3hrt-3oNzDkrc1kcx'
	});
	const { room } = client.enterRoom('your-room-id-10');

	onMount(() => {
		return () => {
			client.logout();
			room.disconnect();
		};
	});
	const document = syncroState({
		sync: async ({ doc, synced }) => {
			const yProvider = new LiveblocksYjsProvider(room, doc);
			yProvider.on('synced', () => {
				synced();
			});
		},
		schema: {
			name: y.string().default('Bob').optional(),
			firstName: y.string().default('Smith'),
			birthday: y.date().default(new Date('2000-01-01')).nullable(),
			age: y.number().nullable().default(25),
			friends: y.array(y.string().optional()).default(['Alice', 'Charlie']),
			family: y.array(y.object({ name: y.string() })),
			todos: y.array(
				y.object({
					title: y.string(),
					done: y.boolean(),
					priority: y.enum('low', 'medium', 'high')
				})
			),
			profile: y
				.object({
					bio: y.string().default('Hello world'),
					settings: y.object({
						theme: y.enum('light', 'dark').default('light'),
						notifications: y.boolean().default(true)
					})
				})
				.optional()
		}
	});

	let friends = $state(['John']);

	const updateName = () => {
		document.name = 'Alice' + Math.floor(Math.random() * 100);
	};

	function updateAge() {
		document.age = Math.floor(Math.random() * 100);
	}

	function addFriend() {
		document.friends.push(`Friend${Math.floor(Math.random() * 100)}`);
	}

	function toggleTheme() {
		if (document.profile?.settings.theme === 'light') {
			document.profile.settings.theme = 'dark';
		} else {
			if (document.profile) {
				document.profile.settings.theme = 'light';
			}
		}
	}

	function addTodo() {
		document.todos.push({
			title: `Task ${Math.floor(Math.random() * 100)}`,
			done: false,
			priority: 'medium'
		});
	}

	function addFamilyMember() {
		document.family.push({
			name: `Family${Math.floor(Math.random() * 100)}`
		});
	}

	function updateFirstName() {
		document.firstName = 'John' + Math.floor(Math.random() * 100);
	}

	function updateBirthday() {
		const randomDate = new Date(Math.floor(Math.random() * Date.now()));
		document.birthday = randomDate;
	}

	function removeFriend() {
		if (document.friends.length > 0) {
			document.friends.pop();
		}
	}

	function toggleTodo() {
		if (document.todos.length > 0) {
			const lastTodo = document.todos[document.todos.length - 1];
			lastTodo.done = !lastTodo.done;
		}
	}

	function updateBio() {
		if (!document.profile) {
			document.profile = {
				bio: 'New bio',
				settings: { theme: 'light', notifications: true }
			};
		}

		if (document.profile) {
			document.profile.bio = `Bio update ${Math.floor(Math.random() * 100)}`;
		}
	}

	function toggleNotifications() {
		if (document.profile) {
			document.profile.settings.notifications = !document.profile.settings.notifications;
		}
	}

	const logNestedState = () => {
		console.log({
			state: document.family.getState?.(),
			yType: document.family.getYType?.(),
			yTypes: document.family.getYTypes?.()
		});
	};

	const json = $derived(JSON.stringify(document, null, 2));
</script>

{#if document.getState?.().synced}
	<div class="grid grid-cols-2 gap-2 p-10">
		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-2">
				<h3 class="text-lg font-bold">Basic Properties</h3>
				<div class="grid grid-cols-2 gap-2">
					<button class="btn btn-primary" onclick={updateName}>{document.name}</button>
					<button class="btn btn-primary" onclick={updateFirstName}>Update First Name</button>
					<button class="btn btn-secondary" onclick={updateAge}>Update Age</button>
					<button class="btn btn-secondary" onclick={updateBirthday}>Update Birthday</button>
				</div>
			</div>

			<div class="flex flex-col gap-2">
				<h3 class="text-lg font-bold">Arrays</h3>
				<div class="grid grid-cols-2 gap-2">
					<button class="btn btn-accent" onclick={addFriend}>Add Friend</button>
					<button class="btn btn-error" onclick={removeFriend}>Remove Friend</button>
					<button class="btn btn-info" onclick={addFamilyMember}>Add Family</button>
					<button class="btn btn-success" onclick={addTodo}>Add Todo</button>
					<button class="btn btn-warning" onclick={toggleTodo}>Toggle Last Todo</button>
				</div>
			</div>

			<div class="flex flex-col gap-2">
				<h3 class="text-lg font-bold">Nested Objects</h3>
				<div class="grid grid-cols-2 gap-2">
					<button class="btn btn-warning" onclick={toggleTheme}>Toggle Theme</button>
					<button class="btn btn-info" onclick={updateBio}>Update Bio</button>
					<button class="btn btn-accent" onclick={toggleNotifications}>Toggle Notifications</button>
				</div>
			</div>
			<div class="flex flex-col gap-2">
				<h3 class="text-lg font-bold">Utils</h3>
				<div class="grid grid-cols-2 gap-2">
					<button class="btn btn-warning" onclick={logNestedState}>Log nested $state</button>
				</div>
			</div>
		</div>
		<div class="">
			<div class="mockup-code p-2">
				<code>
					{#key json}
						<pre use:highlight={json}>es</pre>
					{/key}
				</code>
			</div>
		</div>
	</div>
{/if}
