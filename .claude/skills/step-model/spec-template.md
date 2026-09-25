# Story spec template

Save as `docs/stories/<module>/<story-id>.md`. The architect shows it to the owner for approval before any code is written.

```markdown
# <Story title>

- Module / section: <module> › <section label from moduleNavigation.ts>
- Question: <the one question this story answers>
- Sources: <docs/RESEARCH/... heading(s)>, <quiz ids it supports>
- Status: draft | approved (<date>)

## Code

​```js
<≤ 20 lines, runnable>
​```

## Regions and shots

| Shot | Must keep in frame |
|---|---|
| overview | everything |
| <region> | ... |
| bridge | <region A>, <region B>, links between them |

## Beats

| # | id | Line | Shot | What is on screen (literal) | Caption (≤ 60 words) |
|---|---|---|---|---|---|
| 1 | start | 14 | overview | ... | ... |

Aha beats: #<n> (<the naive model it breaks>), #<n> (...)

## UNSOURCED

- <claims the research report does not back, or "none">
```
