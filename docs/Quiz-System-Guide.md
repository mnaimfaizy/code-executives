# Quiz System Guide

## Overview

Code Executives now includes a shared timed quiz system for every learning module except the Playground.

- Each attempt uses 5 questions.
- Each attempt has a 10-minute timer.
- Every module bank contains 30+ scenario-based questions.
- Attempts and results are stored in localStorage so the learner can resume an in-progress quiz after a refresh.
- Wrong answers include deep links back into the relevant module sections.

## Bank Location

Quiz banks live at the repository root in `quiz-banks/`.

Naming convention:

- `quiz-banks/javascript.quiz.json`
- `quiz-banks/rxjs.quiz.json`
- `quiz-banks/git.quiz.json`
- `quiz-banks/datastructures.quiz.json`
- `quiz-banks/react.quiz.json`
- `quiz-banks/nextjs.quiz.json`
- `quiz-banks/bigo.quiz.json`
- `quiz-banks/python.quiz.json`
- `quiz-banks/systemdesign.quiz.json`
- `quiz-banks/typescript.quiz.json`
- `quiz-banks/ai.quiz.json`
- `quiz-banks/nodejs.quiz.json`
- `quiz-banks/devops.quiz.json`
- `quiz-banks/auth.quiz.json`

## JSON Schema

Every bank is a single JSON object:

```json
{
  "moduleId": "javascript",
  "moduleTitle": "JavaScript",
  "description": "Scenario-based assessment...",
  "version": 1,
  "timeLimitMinutes": 10,
  "questionsPerAttempt": 5,
  "questions": []
}
```

Each question must include:

- `id`
- `type`
- `difficulty`
- `scenario`
- `prompt`
- `explanation`
- `tags`
- `references`

Supported question types:

- `single-choice`
- `multi-select`
- `true-false`
- `ordering`
- `matching`

Type-specific fields:

- `single-choice` and `true-false`: `options`, `correctAnswer:number`
- `multi-select`: `options`, `correctAnswer:number[]`
- `ordering`: `items`, `correctAnswer:string[]`
- `matching`: `premises`, `responses`, `correctAnswer:number[]`

## Runtime Files

- `src/shared/components/quiz/ModuleQuizSection.tsx`
- `src/shared/components/quiz/QuestionRenderer.tsx`
- `src/shared/hooks/useQuizSession.ts`
- `src/shared/constants/moduleNavigation.ts`
- `src/types/quiz.ts`
- `src/utils/quiz.ts`

## localStorage Behavior

Per-module storage keys use the prefix `code-executives.quiz`.

For each module:

- `code-executives.quiz.{module}.active-attempt`
- `code-executives.quiz.{module}.results`

The active-attempt key stores:

- selected question ids
- current answers
- current question index
- start timestamp
- expiry timestamp

The results key stores recent local summaries so learners can see prior scores and tiers.

## Wrong-Answer References

Question `references` use exact section labels from `src/shared/constants/moduleNavigation.ts`.

At review time the runtime resolves those labels into module section links so learners can jump directly back into the source material.

## Generator Agent

Use the workspace custom agent:

- `.github/agents/module-quiz-generator.agent.md`

Its responsibilities:

- read the full existing module bank first
- inspect the module source content
- generate only scenario-based, non-trivial questions
- avoid duplicate questions and duplicate answer sets for near-identical prompts
- preserve stable ids for unchanged questions
- append new question ids sequentially

## Authoring Rules

- Keep question prompts scenario-based.
- Prefer advanced and expert prompts over recall-only trivia.
- Use exact section labels already defined for the module.
- Keep explanations diagnostic and instructional.
- Do not move quiz banks into `src/` or `public/`; the root-level `quiz-banks/` directory is canonical.

## Validation Checklist

Before merging quiz-bank changes:

1. Confirm the JSON file remains valid.
2. Confirm `moduleId` matches the filename.
3. Confirm there are 30+ questions.
4. Confirm at least 5 questions can be sampled without duplicate ids.
5. Confirm reference labels exist in `src/shared/constants/moduleNavigation.ts`.
6. Run `npm run build` to confirm the loader still compiles.