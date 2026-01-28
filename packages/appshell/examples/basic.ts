#!/usr/bin/env bun
/**
 * Basic AppShell example
 * 
 * Demonstrates a simple terminal UI layout with header, navbar, and main content.
 */
import { createCliRenderer, TextRenderable } from "@opentui/core";
import { AppShell } from "../src";

async function main() {
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
    targetFps: 60,
  });

  renderer.start();

  // Create the shell with header and navbar
  const shell = new AppShell(renderer, {
    header: { height: 3 },
    navbar: { width: 20, collapsed: false },
    footer: { height: 2 },
    padding: 1,
    withBorder: true,
  });
  renderer.root.add(shell);

  // Add header
  const header = new AppShell.Header(renderer, {
    backgroundColor: "#1a1b26",
    padding: 1,
  });
  shell.add(header);

  const headerText = new TextRenderable(renderer, {
    content: "My Terminal App",
    fg: "#7aa2f7",
    attributes: 1, // Bold
  });
  header.add(headerText);

  // Add navbar
  const navbar = new AppShell.Navbar(renderer, {
    backgroundColor: "#16161e",
    padding: 1,
  });
  shell.add(navbar);

  const navTitle = new TextRenderable(renderer, {
    content: "Navigation",
    fg: "#bb9af7",
    attributes: 1,
  });
  navbar.add(navTitle);

  const navItem1 = new TextRenderable(renderer, {
    content: "→ Home",
    fg: "#c0caf5",
  });
  navbar.add(navItem1);

  const navItem2 = new TextRenderable(renderer, {
    content: "  Settings",
    fg: "#c0caf5",
  });
  navbar.add(navItem2);

  const navItem3 = new TextRenderable(renderer, {
    content: "  About",
    fg: "#c0caf5",
  });
  navbar.add(navItem3);

  // Add main content
  const main = new AppShell.Main(renderer, {
    backgroundColor: "#1a1b26",
  });
  shell.add(main);

  const mainTitle = new TextRenderable(renderer, {
    content: "Welcome to AppShell Demo!",
    fg: "#7aa2f7",
    attributes: 1,
  });
  main.add(mainTitle);

  const mainContent = new TextRenderable(renderer, {
    content: "This is the main content area.",
    fg: "#c0caf5",
  });
  main.add(mainContent);

  const instructions = new TextRenderable(renderer, {
    content: "Press Ctrl+C to exit",
    fg: "#565f89",
  });
  main.add(instructions);

  // Add footer
  const footer = new AppShell.Footer(renderer, {
    backgroundColor: "#16161e",
    padding: 1,
  });
  shell.add(footer);

  const footerText = new TextRenderable(renderer, {
    content: "Footer - Status: Ready",
    fg: "#9ece6a",
  });
  footer.add(footerText);
}

main();
