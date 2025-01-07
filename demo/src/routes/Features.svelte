<script lang="ts">
	let features = [
		{
			title: 'Yjs under the hood',
			description: 'syncroState uses Yjs to sync the state across multiple users.',
			icon: '🚀'
		},
		{
			title: 'Typesafe',
			description:
				"Even thought Yjs isn't typesafe, syncroState ensures that the state is always valid.",
			icon: '🚀'
		},
		{
			title: 'Typerich',
			description:
				"Arrays, booleans, objects, enums, numbers, strings, dates, nullable and optionnal are all supported even if Yjs doesn't support them natively.",
			icon: '🚀'
		},
		{
			title: 'Fine grained reactivity',
			description:
				'Use it like a normal Svelte state. SyncroState leverages Svelte reactivity and proxies to make the state reactive, easy to use and performant.',
			icon: '🚀'
		},

		{
			title: 'Bindable',
			description: 'Because we love to bind:value, all value are bindables.',
			icon: '🚀'
		},

		{
			title: 'Pluggable',
			description:
				'SyncroState is backend agnostic. You can use it with Liveblocks, but you can also use it with other real-time collaboration libraries (partykit, etc...)',
			icon: '🚀'
		},
		{
			title: 'Undo/Redo',
			description: 'syncroState provides an undo/redo feature out of the box.',
			icon: '🚀'
		}
	];

	const toCome = [
		{
			title: 'More types',
			description: 'More types are coming soon: sets, maps, richtext',
			icon: '🚀'
		},
		{
			title: 'Offline support',
			description: 'SyncroState will support offline mode by design.',
			icon: '🚀'
		},
		{
			title: 'Typed awareness',
			description: 'I plan to provide a simple way to share and update Yjs awareness state.',
			icon: '🚀'
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
					<h3 class="mb-2 text-lg font-semibold">{feature.title}</h3>
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
