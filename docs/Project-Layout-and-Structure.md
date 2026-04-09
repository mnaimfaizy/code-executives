# Project Layout & Structure Documentation

## Overview

This document describes the layout and structure of the Code Executives web application, including navigation, sidebar logic, and page/component organization. The app uses React, Tailwind CSS, and react-router-dom for a modern, scalable UI.

---

## Main Structure

- **Header**: Top navigation bar with links to Home, JavaScript, and About pages. Includes a sidebar toggle button.
- **Sidebar**: Collapsible drawer, context-sensitive. Shows JavaScript theory sections only on the JavaScript page.
- **Footer**: Simple footer with copyright and About link.
- **Main Content**: Renders the current page based on the route.
- **Timed Module Quiz Layer**: Shared end-of-module quiz section rendered inside every learning module, using query-param section routing and root-level quiz banks.

---

## Routing

- Uses `react-router-dom` for navigation.
- Main routes:
  - `/` → Home
  - `/about` → About
  - `/javascript` → JavaScript page (with tabs and sidebar sections)
- Learning modules keep their existing route paths and append the shared quiz through `?section=Quiz` instead of adding separate routes.

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
- `/src/shared/components/quiz/`
  - `ModuleQuizSection.tsx`: Shared quiz shell used across all learning modules.
  - `QuestionRenderer.tsx`: Shared renderer for single-choice, multi-select, true/false, ordering, and matching questions.
- `/src/pages/`
  - `Home.tsx`: Home page.
  - `About.tsx`: About page.
  - `JavaScriptPage.tsx`: Main JavaScript theory/demo page.
  - `JavaScript2D.tsx`, `JavaScript3D.tsx`: Visualization canvases.
- `/src/sections/`
  - Individual theory sub-section components (Introduction, EngineRuntime, etc.)
- `/src/shared/hooks/`
  - `useQuizSession.ts`: Loads root-level quiz banks, persists active attempts, and stores local quiz results in localStorage.
- `/src/shared/constants/`
  - `moduleNavigation.ts`: Shared module section metadata used for quiz references and navigation.
- `/src/types/quiz.ts`
  - Shared quiz schema for bank files, active attempts, and result summaries.
- `/quiz-banks/`
  - Root-level JSON quiz banks named `{module}.quiz.json` so agents and humans can discover them quickly.
- `/.github/agents/module-quiz-generator.agent.md`
  - Workspace agent for growing or updating module quiz banks without duplicating questions or answer sets.

---

## Sidebar Logic

- Sidebar is hidden by default and toggled via the header button.
- Sidebar sections are shown only for the JavaScript page.
- Clicking a sidebar section updates the query param and displays the corresponding theory component.
- The quiz section is appended as the final sidebar entry for every learning module.
- Wrong-answer review links resolve through the shared module navigation metadata so quiz references land on the correct module section.

---

## Quiz System

- Every learning module now ends with a shared quiz experience.
- Each quiz run samples 5 questions from a 30+ question module bank.
- The timer is fixed at 10 minutes and survives refresh via localStorage.
- Results are stored locally and exposed back to the learner in the module quiz sidebar.
- Wrong answers link back to the relevant in-module sections for review.
- Quiz content lives outside `src/` in the root-level `quiz-banks/` directory to keep authoring and agent discovery simple.
- The `module-quiz-generator` custom agent is the canonical workflow for expanding or refreshing module quiz banks.

---

## Styling & Formatting

- Uses Tailwind CSS utilities for consistent, responsive design, and lucide-react for icons.
- Prettier and ESLint used for code formatting and linting.

---

## Next Steps

- Add more languages and context-sensitive sidebar sections.
- Implement code editor and interactive demos for each mode.
- Expand the quiz-bank authoring guide as the generator workflow evolves.

---

_Last updated: April 9, 2026_
