#!/usr/bin/env bun
/**
 * Full AppShell example with all sections
 * 
 * Demonstrates a complete terminal UI layout with header, navbar, aside, footer, and main content.
 */
import { createCliRenderer, type KeyEvent, TextRenderable } from "@opentui/core";
import { AppShell } from "../src";

let footerText: TextRenderable;
let shell: AppShell;

async function main() {
  const renderer = await createCliRenderer({
    exitOnCtrlC: false,
    targetFps: 60,
  });

  renderer.start();

  // Track collapsed state
  let navbarCollapsed = false;
  let asideCollapsed = false;

  function handleKeyPress(key: KeyEvent): void {
  if (key.name === "q") {
    renderer?.destroy();
    process.exit(0);
  } else if (key.name === "n") {
    navbarCollapsed = !navbarCollapsed;
    shell.updateConfiguration({
      navbar: { width: 20, collapsed: navbarCollapsed },
    });
    footerText.content = `Status: Ready | Navbar: ${navbarCollapsed ? "collapsed" : "visible"} | 'n' = navbar | 'a' = aside | 'q' = quit`;
  } else if (key.name === "a") {
    asideCollapsed = !asideCollapsed;
    shell.updateConfiguration({
      aside: { width: 25, collapsed: asideCollapsed },
    });
    footerText.content = `Status: Ready | Aside: ${asideCollapsed ? "collapsed" : "visible"} | 'n' = navbar | 'a' = aside | 'q' = quit`;
  }
}

  // Create shell with all sections
  shell = new AppShell(renderer, {
    header: { height: 3 },
    navbar: { width: 20, collapsed: false },
    aside: { width: 25, collapsed: false },
    footer: { height: 2 },
    padding: 1,
    withBorder: true,
    layout: "default",
  });
  renderer.root.add(shell);

  // Header
  const header = new AppShell.Header(renderer, {
    backgroundColor: "#1a1b26",
    padding: 1,
  });
  shell.add(header);

  const headerText = new TextRenderable(renderer, {
    content: "Full Layout Demo - Header, Navbar, Main, Aside, Footer",
    fg: "#7aa2f7",
    attributes: 1,
  });
  header.add(headerText);

  // Navbar
  const navbar = new AppShell.Navbar(renderer, {
    backgroundColor: "#16161e",
    padding: 1,
  });
  shell.add(navbar);

  const navTitle = new TextRenderable(renderer, {
    content: "Navigation",
    fg: "#bb9af7",
    attributes: 4, // Underline
  });
  navbar.add(navTitle);

  for (let i = 1; i <= 5; i++) {
    const navItem = new TextRenderable(renderer, {
      content: `${i === 1 ? "→" : " "} Menu Item ${i}`,
      fg: "#c0caf5",
    });
    navbar.add(navItem);
  }

  // Main content
  const main = new AppShell.Main(renderer, {
    backgroundColor: "#1a1b26",
  });
  shell.add(main);

  const mainTitle = new TextRenderable(renderer, {
    content: "Main Content Area",
    fg: "#7aa2f7",
    attributes: 1,
  });
  main.add(mainTitle);

  const mainContent = new TextRenderable(renderer, {
    content:
      "This is where your primary content goes. The layout automatically adjusts to accommodate header, footer, navbar, and aside sections.",
    fg: "#c0caf5",
  });
  main.add(mainContent);

  // Aside
  const aside = new AppShell.Aside(renderer, {
    backgroundColor: "#16161e",
    padding: 1,
  });
  shell.add(aside);

  const asideTitle = new TextRenderable(renderer, {
    content: "Aside Panel",
    fg: "#bb9af7",
    attributes: 4,
  });
  aside.add(asideTitle);

  const asideContent = new TextRenderable(renderer, {
    content: "Additional info or actions can go here.",
    fg: "#c0caf5",
  });
  aside.add(asideContent);

  // Footer
  const footer = new AppShell.Footer(renderer, {
    backgroundColor: "#16161e",
    padding: 1,
  });
  shell.add(footer);

  footerText = new TextRenderable(renderer, {
    content: "Status: Ready | 'n' = navbar | 'a' = aside | 'q' = quit",
    fg: "#9ece6a",
  });
  footer.add(footerText);

  // Add keyboard controls
  renderer.keyInput.on("keypress", handleKeyPress);
}

main();
