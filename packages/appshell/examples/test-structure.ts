#!/usr/bin/env bun
import { createCliRenderer } from "@opentui/core";
import { AppShell } from "../dist/index.mjs";
import { writeFileSync } from "fs";

const output: string[] = [];

const renderer = await createCliRenderer({
  exitOnCtrlC: false,
  targetFps: 60,
});

// Don't start renderer for this test
// renderer.start();

const shell = new AppShell(renderer, {
  header: { height: 1 },
  navbar: { width: 10, collapsed: false },
  footer: { height: 1 },
});
renderer.root.add(shell);

const header = new AppShell.Header(renderer, {});
shell.add(header);

const navbar = new AppShell.Navbar(renderer, {});
shell.add(navbar);

const main = new AppShell.Main(renderer, {});
shell.add(main);

const footer = new AppShell.Footer(renderer, {});
shell.add(footer);

output.push("Shell children: " + shell.getChildren().map(c => c.constructor.name).join(", "));
output.push("Header parent: " + (header.parent?.constructor.name || "null"));
output.push("Navbar parent: " + (navbar.parent?.constructor.name || "null"));
output.push("Main parent: " + (main.parent?.constructor.name || "null"));
output.push("Footer parent: " + (footer.parent?.constructor.name || "null"));

if (shell.getChildren().length > 0) {
  const contentRow = shell.getChildren().find(c => c.constructor.name === "BoxRenderable");
  if (contentRow) {
    output.push("ContentRow children: " + contentRow.getChildren().map(c => c.constructor.name).join(", "));
  }
}

writeFileSync("/tmp/appshell-test.txt", output.join("\n"));
console.log(output.join("\n"));

