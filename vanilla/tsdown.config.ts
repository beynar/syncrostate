import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./lib/index.ts"],
  outDir: "./dist",
  format: "esm",
  sourcemap: true,
  clean: true,
  dts: true,
  tsconfig: "./tsconfig.json",
});
