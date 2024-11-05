<script lang="ts">
	import { syncedState } from '$lib/proxys/syncedState.svelte.js';
	import Name from './Name.svelte';
	import { y } from '$lib/schemas/schema.js';
	const synced = syncedState({
		schema: {
			name: y.string().default('John'),
			gender: y.enum('male', 'female').default('female').nullable(),
			firstName: y.string().default('Doe'),
			birthday: y.date().default(new Date()).nullable(),
			age: y.number().nullable().default(30),
			father: y.object({
				name: y.string().default('Alfred'),
				family: y
					.object({
						name: y.string().default('Smith').nullable().optional()
					})
					.optional(),
				father: y.object({
					name: y.string()
				})
			})
		}
	});
</script>

{#if true}
	<div class="prose prose-sm">
		<code>
			{JSON.stringify(synced, null, 2)}
		</code>
	</div>
	<!-- {#if synced.$remotlySynced} -->
	<Name name={synced.name} />
	<div class="grid gap-2">
		<button
			onclick={() => {
				synced.name = synced.name === 'John' ? 'Jane' : 'John';
			}}>name: {synced.name}</button
		>
		<button
			onclick={() => {
				synced.gender === 'male' ? (synced.gender = 'female') : (synced.gender = 'male');
			}}>gender: {synced.gender}</button
		>

		<button
			onclick={() => {
				synced.gender === null ? (synced.gender = 'male') : (synced.gender = undefined);
			}}>set null gender :{synced.gender ? synced.gender : 'null'}</button
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

		<button
			onclick={() => {
				delete synced.name;
			}}>delete name</button
		>

		<button
			onclick={() => {
				if (synced.father?.family) {
					delete synced.father.family;
				} else if (synced.father) {
					synced.father.family = {
						name: 'Smith'
					};
				}
			}}
			>Delete father family
			{synced.father?.family ? 'not null' : 'null'}
		</button>
		<button
			onclick={() => {
				synced.father = {
					family: {
						name: 'Smith'
					},
					name: 'Bob'
				};
			}}>Father: {synced.father?.name}</button
		>
		<button
			onclick={() => {
				synced.father.family = {
					name: synced.father?.family?.name === 'Smith' ? null : 'Smith'
				};
			}}>Father family: {synced.father?.family?.name}</button
		>
		<button
			onclick={() => {
				if (synced.father?.family?.name) {
					delete synced.father.family.name;
				} else {
					synced.father.family.name = 'Smith';
				}
			}}>Father family: {synced.father?.family?.name}</button
		>

		<button
			onclick={() => {
				synced.age = synced.age === null ? Math.random() : null;
			}}>Age: {synced.age}</button
		>
	</div>
{/if}
