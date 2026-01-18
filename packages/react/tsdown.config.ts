import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/styled.ts",
    "src/headless/index.ts",
    "src/headless/badge/index.tsx",
    "src/headless/checkbox/index.tsx",
  ],
  format: "esm",
  dts: true,
  clean: true,
  external: [
    "@opentui/core",
    "@opentui/react",
    "@opentui-ui/core",
    "@opentui-ui/styles",
    "react",
  ],
});
