<script lang="ts">
	import { syncedState } from '$lib/proxys/syncedState.svelte.js';
	import { SvelteDate, SvelteMap } from 'svelte/reactivity';
	let date = new SvelteDate();
	import Mark from './Mark.svelte';
	const state = syncedState({
		schema: {
			name: 'string',
			father: {
				name: 'string',
				father: {
					name: 'string'
				}
			},
			age: 'number'
		}
	});

	const marks = new SvelteMap(
		Object.entries({
			bold: true,
			italic: true
		})
	);
</script>

<div class="flex flex-col gap-2 my-10">
	{#each marks as [mark, value] (`${mark}-${value}`)}
		<Mark {mark} key={value} />
	{/each}
</div>
<button
	onclick={() => {
		marks.set('bold', !marks.get('bold'));
	}}>toggle bold</button
>

{date}
<div>Name: {state.father.father.name}</div>
<div>Age: {state.age} {typeof state.age}</div>
<button
	onclick={() => {
		state.father.father.name = 'Jane' + Math.random();
	}}>Change Name</button
>
<button
	onclick={() => {
		state.age = Math.random();
	}}>Change age</button
>
<button
	onclick={() => {
		state.$redo();
	}}>Redo</button
>
<button
	onclick={() => {
		state.$undo();
	}}>Undo</button
>
<button
	onclick={() => {
		state.$doc.getText('name').insert(0, 'Jane' + Math.random());
	}}>Change Name by transact</button
>
<button
	onclick={() => {
		console.log(JSON.stringify(state, null, 2));
	}}>number</button
>
<hr />
