<script>
	import { browser } from '$app/environment';
	import Canvas from '$lib/canvas.svelte';
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

		<section id="about" class="border-t border-white/10 py-24">
			<div class="container mx-auto max-w-2xl px-6">
				<h2 class="mb-6 text-center text-2xl font-bold">About syncroState</h2>
				<p class="mb-4 text-white/70">
					syncroState is an open-source library that brings the power of real-time collaboration to
					Svelte applications. By leveraging Yjs, it enables seamless state synchronization across
					multiple users, making it ideal for building collaborative tools, real-time editors, and
					multiplayer experiences.
				</p>
				<p class="text-white/70">
					With its simple API and deep integration with Svelte's reactivity system, syncroState
					makes it easy to add real-time capabilities to your projects without compromising on
					performance or developer experience.
				</p>
				<h2 class="mb-6 mt-10 text-center text-2xl font-bold">Crédits</h2>
				<p class="mb-4 text-white/70">
					SyncroState is builds directly on Yjs ❤️. It's also inspired by and builds upon the
					amazing work of SyncedStore. It also builds on top of the amazing Svelte reactivity
					system.
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
