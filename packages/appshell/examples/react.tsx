#!/usr/bin/env bun

/** @jsxImportSource @opentui/react */

import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard, useRenderer } from "@opentui/react";
import { AppShell } from "@opentui-ui/appshell/react";
import { useState } from "react";

function App() {
  const renderer = useRenderer();
  const [navbarCollapsed, setNavbarCollapsed] = useState(false);
  const [asideCollapsed, setAsideCollapsed] = useState(false);

  useKeyboard((key) => {
    if (key.name === "q") {
      renderer.destroy();
    } else if (key.name === "n") {
      setNavbarCollapsed((prev) => !prev);
    } else if (key.name === "a") {
      setAsideCollapsed((prev) => !prev);
    }
  });

  return (
    <AppShell
      layout="default"
      header={{ height: 3 }}
      navbar={{ width: 20, collapsed: navbarCollapsed }}
      aside={{ width: 25, collapsed: asideCollapsed }}
      footer={{ height: 2 }}
      padding={1}
      withBorder={true}
    >
      <AppShell.Header backgroundColor="#1a1b26" padding={1}>
        <text fg="#7aa2f7" attributes={1}>
          AppShell React Example - Press 'q' to quit
        </text>
      </AppShell.Header>

      <AppShell.Navbar backgroundColor="#16161e" padding={1}>
        <text fg="#9ece6a">Navigation</text>
        <text>• Home</text>
        <text>• About</text>
        <text>• Settings</text>
      </AppShell.Navbar>

      <AppShell.Main padding={2}>
        <text fg="#c0caf5" attributes={1}>
          Main Content Area
        </text>
        <text>This is the main content area of the application.</text>
        <text>It can contain any terminal UI components.</text>
      </AppShell.Main>

      <AppShell.Aside backgroundColor="#1f2335" padding={1}>
        <text fg="#bb9af7">Aside Panel</text>
        <text>Additional information or tools can go here.</text>
      </AppShell.Aside>

      <AppShell.Footer backgroundColor="#16161e" padding={1}>
        <text fg="#565f89">
          Navbar: {navbarCollapsed ? "collapsed" : "visible"} | Aside: {asideCollapsed ? "collapsed" : "visible"} | 'n' = navbar | 'a' = aside | 'q' = quit
        </text>
      </AppShell.Footer>
    </AppShell>
  );
}

const renderer = await createCliRenderer({ exitOnCtrlC: true, targetFps: 60 });
createRoot(renderer).render(<App />);
