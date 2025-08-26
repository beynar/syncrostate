<script>
	import { browser } from '$app/environment';
	import Canvas from '$lib/canvas.svelte';
	import DiscriminatedUnionDemo from '$lib/DiscriminatedUnionDemo.svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Usage from './Usage.svelte';
	import Features from './Features.svelte';

	let visible = false;

	onMount(() => {
		visible = true;
	});

	let { data } = $props();

	console.log({ data });
</script>

<div class="dark">
	<main class="min-h-screen bg-black text-white">
		<header class="border-b border-white/10">
			<nav class="container mx-auto flex items-center justify-between px-6 py-4">
				<div class="text-xl font-bold">syncroState</div>
				<div class="space-x-6">
					<a href="#features" class="hover:underline">Features</a>
					<a href="#demo" class="hover:underline">Demo</a>
					<a href="#about" class="hover:underline">About</a>
					<a
						href="https://github.com/beynar/syncrostate"
						target="_blank"
						rel="noopener noreferrer"
						class="hover:underline">GitHub</a
					>
				</div>
			</nav>
		</header>

		<section class="container mx-auto px-6 py-24 text-center">
			<h1 transition:fade={{ duration: 500 }} class="mb-4 text-4xl font-bold">syncroState</h1>
			<p transition:fade={{ duration: 500, delay: 200 }} class="mb-8 text-xl">
				Bringing Svelte reactivity to the multiplayer level
			</p>

			<div class="mockup-code mx-auto max-w-[100px] border border-white/10">
				<pre data-prefix="$"><code>pnpm add syncroState</code></pre>
			</div>
		</section>

		<Features />

		<Usage />
		<section id="demo" class="relative border-t border-white/10 p-10">
			<h2 class="mb-12 text-center text-2xl font-bold">Demo</h2>
			<p class="mb-8 text-center text-lg text-white/70">
				Drag and drop shapes to the canvas and see them sync across multiple users.
			</p>

			{#if browser}
				<Canvas />
			{/if}
		</section>

		<section id="discriminated-union-demo" class="border-t border-white/10 py-24">
			<div class="container mx-auto px-6">
				<h2 class="mb-6 text-center text-3xl font-bold">Discriminated Union Demo</h2>
				<p class="mb-8 text-center text-lg text-white/70">
					See how discriminated unions provide type-safe state management for complex scenarios like
					API responses and user types.
				</p>

				{#if browser}
					<DiscriminatedUnionDemo />
				{/if}
			</div>
		</section>

		<section id="about" class="border-t border-white/10 py-24">
			<div class="container mx-auto max-w-2xl px-6 text-center">
				<h2 class="mb-6 text-center text-2xl font-bold">About syncroState</h2>
				<p class="mb-4 text-white/70">
					SyncroState is my contribution to the Svelte Hackathon. Hope you enjoy it!
				</p>
				<p class="mb-4 text-white/70">
					Documentation is available on the <a
						href="https://github.com/beynar/syncrostate"
						target="_blank"
						class="text-blue-500 hover:underline"
						rel="noopener noreferrer">GitHub repository</a
					>.
				</p>
				<h2 class="mb-6 mt-10 text-center text-2xl font-bold">Crédits</h2>
				<p class="mb-4 text-white/70">
					SyncroState is built upon Yjs ❤️, the powerful CRDT library that makes real-time
					collaboration possible. We gratefully acknowledge SyncedStore for pioneering collaborative
					state management concepts, and the Svelte team for their exceptional framework and new
					reactivity system that serves as our foundation.
				</p>
			</div>
		</section>

		<footer class="border-t border-white/10 py-8">
			<div class="container mx-auto px-6 text-center text-white/70">
				<p>&copy; {new Date().getFullYear()} beynar. Open-source project. MIT License.</p>
				<div class="mt-4 space-x-6">
					<a
						href="https://github.com/yourusername/syncroState"
						target="_blank"
						rel="noopener noreferrer"
						class="hover:text-white">GitHub</a
					>
					<a href="https://github.com/yourusername/syncroState" class="hover:text-white"
						>Documentation</a
					>
				</div>
			</div>
		</footer>
	</main>
</div>

<style>
	:global(html) {
		background-color: black;
	}
</style>
