<script lang="ts">
	let features = [
		{
			title: 'Powered by Yjs',
			description: 'Industry-leading CRDT for conflict-free real-time collaboration',
			icon: '🚀'
		},
		{
			title: 'Type-Safe',
			description: 'Full TypeScript support with rich type inference',
			icon: '🔒'
		},
		{
			title: 'Svelte Native',
			description: 'Works like regular Svelte state with fine-grained reactivity',
			icon: '💫'
		},
		{
			title: 'Rich Data Types',
			description: 'Support for primitives, arrays, objects, dates, enums, and more',
			icon: '🎯'
		},
		{
			title: 'Provider Agnostic',
			description: 'Works with Liveblocks, PartyKit, or any Yjs provider',
			icon: '🔌'
		},
		{
			title: 'Undo/Redo',
			description: 'Built-in support for state history',
			icon: '↩️'
		},
		{
			title: 'Bindable',
			description: 'Use bind:value like you would with any Svelte state',
			icon: '🎮'
		},
		{
			title: 'Optional & Nullable',
			description: 'Flexible schema definition with optional and nullable fields',
			icon: '🎨'
		}
	];

	const toCome = [
		{
			title: 'Sets and Maps',
			description: 'Adding support for Set and Map types',
			icon: '🚀'
		},
		{
			title: 'Optional Schema',
			description: 'Working on making syncrostate schema optional',
			icon: '🎯'
		},
		{
			title: 'Recursive Types',
			description: 'Adding support for recursive types',
			icon: '🔄'
		},
		{
			title: 'Nested Documents',
			description: 'Planning to add support for nested documents',
			icon: '📑'
		}
	];
</script>

<section
	id="features"
	class="b

order-t border-white/10 pb-24 pt-12"
>
	<div class="container mx-auto px-6">
		<h2 class="mb-12 mt-0 text-center text-2xl font-bold">Features</h2>
		<div class="grid grid-cols-1 gap-12 md:grid-cols-3">
			{#each features as feature}
				<div class="border border-white/10 p-6">
					<h3 class="mb-2 text-lg font-semibold">{feature.icon} {feature.title}</h3>
					<p class="text-sm text-white/70">{feature.description}</p>
				</div>
			{/each}
		</div>
	</div>
	<div class="container mx-auto mt-10 grid grid-cols-1 gap-12 px-6">
		<div class="mt-10 grid grid-cols-1 md:grid-cols-3">
			<h3 class="mb-2 text-lg font-semibold md:col-span-3">What's coming</h3>
			{#each toCome as feature}
				<div class="border border-white/10 p-6">
					<h3 class="mb-2 text-lg font-semibold">{feature.title}</h3>
					<p class="text-sm text-white/70">{feature.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
