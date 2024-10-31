<script lang="ts">
	import { syncedState } from '$lib/proxys/syncedState.svelte.js';
	import { SvelteDate, SvelteMap } from 'svelte/reactivity';
	import Name from './Name.svelte';
	import { y } from '$lib/schemas/schema.js';
	import { createClient } from '@liveblocks/client';

	const synced = syncedState({
		schema: {
			name: y.string().default('John'),
			firstName: y.string().default('Doe'),
			gender: y.enum('male', 'female').default('male'),
			birthday: y.date().default(new Date()).nullable(),
			age: y.number().nullable().default(30),
			father: y.object({
				name: y.string().default('Alfred')
				// father: y.object({
				// 	name: y.string()
				// })
			})
		}
	});

	const marks = new SvelteMap(
		Object.entries({
			bold: true,
			italic: true
		})
	);
</script>

{synced.$remotlySynced}
{#if synced.$remotlySynced}
	<Name name={synced.name} />
	<div class="grid gap-2">
		<button
			onclick={() => {
				synced.gender = synced.gender === 'male' ? 'female' : 'male';
			}}>gender: {synced.gender}</button
		>
		<button
			onclick={() => {
				synced.gender = null;
			}}>set null gender</button
		>
		<button
			onclick={() => {
				synced.birthday && synced.birthday.setDate(synced.birthday.getDate() + 1);
			}}>birthday: {synced.birthday?.toLocaleDateString('fr-FR')}</button
		>
		<button
			onclick={() => {
				synced.birthday ? (synced.birthday = null) : (synced.birthday = new Date());
			}}>birthday: {synced.birthday ? 'not null' : 'null'}</button
		>
		<button
			onclick={() => {
				synced.name = synced.name === 'John' ? 'Jane' : 'John';
			}}>Name: {synced.name}</button
		>
		<button
			onclick={() => {
				synced.firstName = synced.firstName === 'Doe' ? 'Smith' : 'Doe';
			}}>here Name: {synced.firstName}</button
		>

		<!-- <button
		onclick={() => {
			delete synced.name;
		}}>delete name</button
	> -->

		<!-- <button
		onclick={() => {
			synced.father.name = synced.father.name === 'Alfred' ? 'Bob' : 'Alfred';
		}}>Father: {synced.father.name}</button
	>

	<button
		onclick={() => {
			synced.age = synced.age === null ? Math.random() : null;
		}}>Age: {synced.age}</button
	> -->
	</div>
	<!-- {date}
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
<hr /> -->
{/if}
