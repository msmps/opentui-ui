#!/usr/bin/env bun
import { createCliRenderer, TextRenderable } from "@opentui/core";
import { AppShell } from "../dist/index.mjs";

async function main() {
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
    targetFps: 60,
  });

  renderer.start();

  const shell = new AppShell(renderer, {
    header: { height: 3 },
    navbar: { width: 15, collapsed: false },
    footer: { height: 3 },
    withBorder: true,
  });
  renderer.root.add(shell);

  const header = new AppShell.Header(renderer, {
    backgroundColor: "#ff0000",
  });
  shell.add(header);
  const headerText = new TextRenderable(renderer, {
    content: "HEADER",
    fg: "#ffffff",
  });
  header.add(headerText);

  const navbar = new AppShell.Navbar(renderer, {
    backgroundColor: "#00ff00",
  });
  shell.add(navbar);
  const navText = new TextRenderable(renderer, {
    content: "NAVBAR",
    fg: "#000000",
  });
  navbar.add(navText);

  const main = new AppShell.Main(renderer, {
    backgroundColor: "#0000ff",
  });
  shell.add(main);
  const mainText = new TextRenderable(renderer, {
    content: "MAIN CONTENT",
    fg: "#ffffff",
  });
  main.add(mainText);

  const footer = new AppShell.Footer(renderer, {
    backgroundColor: "#ffff00",
  });
  shell.add(footer);
  const footerText = new TextRenderable(renderer, {
    content: "FOOTER",
    fg: "#000000",
  });
  footer.add(footerText);
}

main();
