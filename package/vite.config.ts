import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],

	test: {
		// include: ['src/tests/**/object.proxy.{test,spec}.{js,ts}'],
		include: ['src/tests/**/*.{test,spec}.{js,ts}'],
		coverage: {
			provider: 'v8',
			enabled: true,
			include: ['src/lib/**/*.{svelte,ts}']
		}
	}
});
