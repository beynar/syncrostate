import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [],
  test: {
    // include: [
    // 	'src/tests/**/map.proxy.{test,spec}.{js,ts}',
    // 	'src/tests/**/map.{test,spec}.{js,ts}',
    // 	'src/tests/**/syncroState.{test,spec}.{js,ts}'
    // ],
    // include: ['src/tests/**/syncroState.{test,spec}.{js,ts}'],
    include: ["tests/**/*.{test,spec}.{js,ts}"],
    coverage: {
      provider: "v8",
      enabled: true,
      include: ["src/lib/**/*.{svelte,ts}"],
    },
  },
});
