# Scenario spec template

Save as `docs/stories/<module>/<scenario-id>.md`. Like a story spec, the architect shows it to the owner for approval before any code is written. Rules: [ADR 0003](../../../docs/adr/0003-scenarios-with-choice-points.md) and the Scenarios section of [SKILL.md](SKILL.md).

```markdown
# <Scenario title>

- Module: <module> › Visualization (gallery)
- Workflow: <the real-world task, one sentence>
- Invisible effects it reveals: <what learners can't see on a real team, e.g. a stale origin/main>
- Concepts touched: <section labels from moduleNavigation.ts>
- Sources: <docs/RESEARCH/... heading(s)>, <quiz ids it supports>
- Status: draft | approved (<date>)

## Cast

| id | Name tag | Role | Their copy (region) |
|---|---|---|---|
| you | You | developer | your laptop's clone |
| <id> | <name> | teammate / reviewer / bot / server | ... |

## Regions and shots

| Shot | Must keep in frame |
|---|---|
| overview | every region |
| <region> | ... |
| bridge | <region A>, <region B>, links between them |

## Paths

​```
main ──► choice "<question>" ──► <option-a> ──► ending
                              └─► <option-b> ──► ending
​```

### main (5–10 beats)

| # | id | Time | Actor | Command | Shot | What is on screen (literal) | Caption (≤ 60 words) |
|---|---|---|---|---|---|---|---|
| 1 | start | Mon 09:02 | you | `git switch -c ...` | overview | ... | ... |

Choice point at beat <n>: "<question>"
- <option-a>: <label> → path `<option-a>`
- <option-b>: <label> → path `<option-b>`

### <option-a> (3–6 beats)

| # | id | Time | Actor | Command | Shot | What is on screen | Caption |
|---|---|---|---|---|---|---|---|

Outcome (ending beat): <one or two sentences: what this choice cost or bought>

### <option-b> (3–6 beats)

...

Aha beats: <path>#<n> (<the naive model it breaks>), ...

## UNSOURCED

- <claims the research report does not back, or "none">
```
