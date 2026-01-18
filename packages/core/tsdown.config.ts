import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/badge/index.ts", "src/checkbox/index.ts"],
  format: "esm",
  dts: true,
  clean: true,
  external: ["@opentui/core"],
  define: {
    __DEV__: 'process.env.NODE_ENV !== "production"',
  },
});
