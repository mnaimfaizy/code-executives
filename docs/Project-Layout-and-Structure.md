# Project Layout & Structure Documentation

## Overview

This document describes the layout and structure of the Code Executives web application, including navigation, sidebar logic, and page/component organization. The app uses React, Material UI, and react-router-dom for a modern, scalable UI.

---

## Main Structure

- **Header**: Top navigation bar with links to Home, JavaScript, and About pages. Includes a sidebar toggle button.
- **Sidebar**: Collapsible drawer, context-sensitive. Shows JavaScript theory sections only on the JavaScript page.
- **Footer**: Simple footer with copyright and About link.
- **Main Content**: Renders the current page based on the route.

---

## Routing

- Uses `react-router-dom` for navigation.
- Main routes:
  - `/` → Home
  - `/about` → About
  - `/javascript` → JavaScript page (with tabs and sidebar sections)

---

## JavaScript Page

- **Tabs**: Switch between 2D and 3D visualization modes.
- **Sidebar Sections**: Introduction, Engine & Runtime, Execution Model, Event Loop, Memory Management, Visualization.
- **Theory Section**: Displays the selected theory sub-section based on sidebar navigation (using query param `section`).
- **Canvas Area**: Shows either 2D or 3D demo based on selected tab.

---

## Component Organization

- `/src/components/`
  - `Header.tsx`: AppBar with navigation and sidebar toggle.
  - `Sidebar.tsx`: Drawer with context-sensitive section links.
  - `Footer.tsx`: Footer bar.
- `/src/pages/`
  - `Home.tsx`: Home page.
  - `About.tsx`: About page.
  - `JavaScriptPage.tsx`: Main JavaScript theory/demo page.
  - `JavaScript2D.tsx`, `JavaScript3D.tsx`: Visualization canvases.
- `/src/sections/`
  - Individual theory sub-section components (Introduction, EngineRuntime, etc.)

---

## Sidebar Logic

- Sidebar is hidden by default and toggled via the header button.
- Sidebar sections are shown only for the JavaScript page.
- Clicking a sidebar section updates the query param and displays the corresponding theory component.

---

## Styling & Formatting

- Uses Material UI for consistent, responsive design.
- Prettier and ESLint used for code formatting and linting.

---

## Next Steps

- Add more languages and context-sensitive sidebar sections.
- Implement code editor and interactive demos for each mode.
- Expand documentation as new features are added.

---

_Last updated: September 15, 2025_
