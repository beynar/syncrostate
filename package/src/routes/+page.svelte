<script lang="ts">
	import { syncroState } from '$lib/proxys/syncroState.svelte.js';
	import { y } from '$lib/schemas/schema.js';
	const synced = syncroState({
		// connect: async ({ doc }) => {
		// 	return new Promise((resolve, reject) => {
		// 		const client = createClient({
		// 			publicApiKey: 'pk_prod_TXiiCUekyBO_3gntGdLDEyqmJ0Qc6AqyfAoz0Pntk5JlzC4sSWFmjh4cP73rWXpm'
		// 		});
		// 		const { room } = client.enterRoom('your-room-id-5');
		// 		const yProvider = new LiveblocksYjsProvider(room, doc);
		// 		yProvider.on('synced', () => {
		// 			resolve();
		// 		});
		// 	});
		// },
		schema: {
			name: y.string().default('John').optional(),
			gender: y.enum('male', 'female').default('female').nullable(),
			firstName: y.string().default('Doe'),
			birthday: y.date().default(new Date()).nullable(),
			age: y.number().nullable().default(30),
			friends: y.array(y.string().optional()).default(['Test']),
			family: y.array(y.object({ name: y.string() })),
			nodes: y.array(
				y.object({
					type: y.enum('rect', 'circle'),
					x: y.number(),
					y: y.number(),
					width: y.number(),
					height: y.number(),
					fill: y.string()
				})
			),
			father: y
				.object({
					name: y.string().default('Alfred'),
					wife: y.object({
						name: y.string()
					})
				})
				.optional()
		}
	});

	let friends = $state(['John']);
</script>

{#if synced.$state.remotlySynced}
	<div class="prose prose-sm">
		<code>
			{JSON.stringify(synced, null, 2)}
		</code>
	</div>

	<div class="prose prose-sm">
		<code>
			{JSON.stringify(friends, null, 2)}
		</code>
	</div>

	<div class="grid gap-2">
		<button
			onclick={() => {
				synced.nodes.push({
					type: 'rect',
					x: 100,
					y: 100,
					width: 100,
					height: 100,
					fill: 'string'
				});
			}}>Push node</button
		>
		<button
			onclick={() => {
				synced.name = synced.name === 'John' ? 'Jane' : 'John';
			}}>name: {synced.name}</button
		>
		<button
			onclick={() => {
				synced.family.push({ name: 'John' });
				// synced.family = [];
				// if (synced.family[0]) {
				// 	console.log('synced.family[0]', synced.family[0]);
				synced.family[0] = { name: synced.family[0].name === 'John' ? 'Jane' : 'John' };
				// } else {
				// 	console.log('synced.family.push', synced.family[0]);
				// 	synced.family.push({ name: 'John' });
				// }
			}}>family name: {synced.family?.[0]?.name}</button
		>
		<button
			onclick={() => {
				synced.friends[0] === 'John' ? (synced.friends[0] = 'Jack') : (synced.friends[0] = 'John');
				friends[0] === 'John' ? (friends[0] = 'Jack') : (friends[0] = 'John');
			}}
		>
			set friends[0] {synced.friends[0]}
		</button>
		<button
			onclick={() => {
				synced.friends = ['John'];
				friends = ['John'];
			}}
		>
			reset friends
		</button>
		<button
			onclick={() => {
				const value = synced.friends[1] === 'HELLO' ? 'WORLD' : 'HELLO';
				synced.friends.splice(1, 1, value);
				friends.splice(1, 1, value);
			}}
		>
			splice friends
		</button>
		<button
			onclick={() => {
				synced.friends.push('Jack', 'John');
				friends.push('Jack', 'John');
			}}
		>
			push friends
		</button>
		<button
			onclick={() => {
				synced.friends.pop();
				friends.pop();
			}}
		>
			pop friends
		</button>

		<button
			onclick={() => {
				synced.friends.unshift('Unshift-1', 'Unshift-2');
				friends.unshift('Unshift-1', 'Unshift-2');
			}}
		>
			unshift friends
		</button>

		<button
			onclick={() => {
				synced.friends[0] = undefined;
				friends[0] = undefined;
			}}
		>
			delete friends
		</button>
		<button
			onclick={() => {
				synced.friends = ['John', 'Jane'];
				friends = ['John', 'Jane'];
			}}
		>
			set friends
		</button>
	</div>
{/if}
