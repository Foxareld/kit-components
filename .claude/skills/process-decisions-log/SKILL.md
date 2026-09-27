---
name: process-decisions-log
description: Convert unprocessed entries in docs/decisions-log.md into polished, reader-facing docs (docs/architecture-decisions.md, docs/accessibility-patterns.md, docs/theming.md, docs/integration-mistakes.md). Use this whenever the user asks to "process the decisions log," "convert the decisions log," "run the decisions-log conversion," "turn the log entries into docs," or otherwise wants the accumulated CLAUDE.md-mandated decision-log entries turned into RAG-ready/shareable documentation — even without an explicit slash-command-style phrasing, and even if they just say "process new entries in the log" or "catch up the docs." This is a recurring maintenance task meant to run periodically as new entries accumulate, not a one-time job.
user-invocable: true
---

# Process decisions-log

This project's [CLAUDE.md](../../../CLAUDE.md) requires logging non-obvious decisions to
`docs/decisions-log.md` as work happens. That log is a raw, chronological, symptom-first
running record — useful to a future engineer digging through history, but not something
you'd hand a new consumer of the library or feed into a RAG index as-is. This skill takes
the entries nobody's converted yet and rewrites them into the polished docs that actually
get read.

Because the log keeps growing, this has to be safe to re-run indefinitely: only touch
entries that haven't been converted before, and leave a durable marker so the next run
knows where to pick up.

## 1. Find the unprocessed entries

Read `docs/decisions-log.md`. Each entry looks like:

```
## [heading]
**Tag:** [architecture | accessibility | theming | testing | forms | other]
**Audience:** [consumer | internal]
**Symptom/question:** ...
**Decision:** ...
**Why:** ...
```

An entry that already has a `**Processed:** yes` line directly under its `**Why:**` field
was converted on a previous run — skip it. Only entries without that marker get processed
this run. If every entry already has the marker, say so and stop; there's nothing to do.

## 2. Route each entry by Tag (and Audience, for forms)

| Tag | Destination |
|---|---|
| `architecture` | `docs/architecture-decisions.md` |
| `accessibility` | `docs/accessibility-patterns.md` |
| `theming` | `docs/theming.md` |
| `forms`, audience `consumer` | `docs/integration-mistakes.md` |
| `forms`, audience `internal` | `docs/architecture-decisions.md` |
| `testing` or `other` | judgment call — default to `docs/architecture-decisions.md` if genuinely unsure |

Create the destination doc with a top-level `# [Topic name]` heading if it doesn't exist
yet. Never skip an entry — if the tag/audience combination feels ambiguous, make the best
call you can and note it at the end of your summary so the user can double-check it, but
still convert and file it somewhere.

## 3. Rewrite the entry

The raw log's field structure (`Symptom/question` / `Decision` / `Why`) exists so logging
is fast in the moment — bullet-shaped, no need to think about prose. The polished doc is
for a reader who never saw the log and doesn't care about its bookkeeping. Converting means
actually re-authoring, not just deleting the bold labels and leaving three loose sentences.

**Merge the three fields into flowing prose — two short paragraphs at most.** Roughly:
paragraph one states the problem (what a reader would hit), paragraph two gives the
resolution and the reasoning behind it. Don't keep the bold field labels in the output.

**Cut anything that's about the log or this repo's process, not about the decision
itself.** A line like "this repo's CLAUDE.md specifically calls this out as a bug pattern
to avoid" is a note-to-self from the moment of logging — it tells a reader nothing about
the actual system. Same for log-navigation cross-references like "see below" or "see the
decision above": they pointed at another entry's position in the log, which won't exist in
the target doc.

**Never mention the predecessor library or its `fs-<name>` components in the output.**
Some raw log entries cite `fs-<name>` behavior as part of their own reasoning (e.g. "this
mirrors the predecessor's `_calculateCurrentIndexOrSelectFirst` behavior") — that's fine to
leave in the raw log, since it's an internal provenance note, but drop it when converting.
The polished docs describe Kit's own design on its own terms; a reader shouldn't need to
know a predecessor library existed to understand why something works the way it does. If
removing the mention leaves a decision's "why" thinner than it should be, restate the
reasoning in terms of Kit's own constraints instead of dropping the sentence entirely.

**Trim connective scaffolding.** Prefer direct statements over "thus," "the reason for
this is," "this decision was made because." State the problem, then the resolution, then
the reasoning, without narrating the transitions between them out loud.

**Heading, by audience** — this is the part most likely to be undershot, so give it real
thought:
- **consumer** entries: rewrite the heading as the actual problem a developer would type
  into a search bar or ask a chatbot — first-person or symptom-phrased, in quotes, not a
  topic label. ("kit-dropdown — disableTrigger vs. a new disabled property" is a topic
  label; "I set `disableTrigger` expecting the trigger to look disabled, but it still
  looks interactive" is the actual question.)
- **internal** entries: the heading can stay close to the log's original wording if it
  already states the finding rather than just naming an area. Tighten it if it's still
  topic-first ("kit-dropdown — forcing open=false on disable" → "Forcing open=false on
  disable in kit-dropdown moved to willUpdate()").

**Metadata comment** — immediately under the heading (exact blank-line spacing doesn't
matter), add:

```
<!-- tag: [tag value], audience: [audience value] -->
```

### Calibration: match this level of editing

Don't undershoot (deleting the bold labels and calling the remaining fragments a doc entry)
and don't overshoot (adding facts, examples, or reasoning that weren't in the original —
this is a rewrite, not an elaboration).

**Consumer, before → after:**

```
## kit-dropdown — disableTrigger vs. a new disabled property
**Tag:** architecture
**Audience:** consumer
**Symptom/question:** Wanted a disabled dropdown trigger (e.g. a `kit-button`) to show its own disabled styling. The existing `disableTrigger` property looked like the obvious place to add this, but it only suppresses the automatic click-to-toggle wiring — the trigger stays fully interactive by design, since it exists for cases like a search-input trigger where opening is driven by something else internal to it (a separate icon button), not by clicking the input itself.
**Decision:** Added a separate `disabled` property instead of repurposing `disableTrigger`. `disabled` blocks opening entirely (trigger click and `toggle()` both no-op) and sets `disabled`/`aria-disabled` on the assigned trigger element(s) so components like `kit-button` render their own disabled state. `disableTrigger` keeps its original, narrower meaning unchanged.
**Why:** Repurposing `disableTrigger` to also disable the trigger would have broken the exact case it was added for. Keeping them separate means each property does one thing, and neither has to guess at the other's intent.
```

```
## "I set `disableTrigger` expecting the trigger to look disabled, but it still looks interactive"
<!-- tag: architecture, audience: consumer -->
`disableTrigger` and `disabled` are not the same thing, on purpose. `disableTrigger` only turns off the automatic click-to-toggle wiring, it exists for triggers that open the dropdown some other way (a search input with a separate icon button, for example), and the trigger itself stays fully interactive. It was never meant to convey a disabled visual state.

If you actually want the dropdown unopenable and the trigger showing disabled styling, use `disabled` instead. It blocks both trigger clicks and `toggle()` from opening the dropdown, and sets `disabled`/`aria-disabled` on the assigned trigger so components like `kit-button` render their own disabled look. The two properties are kept separate deliberately, so `disableTrigger` doesn't have to guess whether you also wanted it visually disabled.
```

**Internal, before → after:**

```
## kit-dropdown — forcing open=false on disable without a double render
**Tag:** forms
**Audience:** internal
**Symptom/question:** When `disabled` becomes true while the dropdown is open, it needs to close. Setting `this.open = false` as a side effect inside `updated()` works, but mutating a reactive property inside `updated()` schedules a second, visible update cycle (Lit's "change-in-update" warning) — this repo's CLAUDE.md specifically calls this out as a bug pattern to avoid.
**Decision:** Moved the `disabled → open = false` forcing into `willUpdate()` instead of `updated()`, so the same render cycle already reflects the closed state.
**Why:** `willUpdate()` runs before Lit commits the render, so a property mutated there is visible to the rest of that same update pass — no extra cycle, no dev-mode warning. Confirmed empirically: after the fix, `dropdown.test.ts`'s browser console shows no change-in-update warning, unlike a few other components in this repo that have one from an unrelated (accepted) mount-time cascade.
```

```
## Forcing open=false on disable in kit-dropdown moved to willUpdate()
<!-- tag: forms, audience: internal -->
When `disabled` becomes true while the dropdown is open, it needs to close. Setting `this.open = false` inside `updated()` works, but mutating a reactive property there schedules a second, visible update cycle (Lit's change-in-update warning). Moved the forcing into `willUpdate()` instead, so the same render cycle already reflects the closed state.

`willUpdate()` runs before Lit commits the render, so a property mutated there is visible within that same update pass, no extra cycle, no warning. Confirmed empirically: after the fix, `dropdown.test.ts`'s console shows no change-in-update warning, unlike a few other components in this repo with one from an unrelated, accepted mount-time cascade.
```

Note what carried over unchanged (the technical content, the causal chain) versus what got
cut (the parenthetical about CLAUDE.md calling out the pattern — that's process
meta-commentary) versus what got tightened (the heading, the connective phrasing).

## 4. Mark each converted entry as processed

Once an entry has been rewritten and appended to its destination doc, go back to that
entry in `docs/decisions-log.md` and add one line directly under its existing `**Why:**`
field:

```
**Processed:** yes
```

Don't otherwise edit, reorder, or delete anything in the log — it stays the raw running
record. This marker is the entire mechanism that makes the task idempotent; get it right
and next run only sees genuinely new entries.

## 5. Report, and stop — don't commit

Summarize what moved where (which entries, which destination docs, any new docs created).
If any tag/audience call was a judgment call rather than clear-cut, name it explicitly so
the user can double check it.

Leave everything unstaged/uncommitted. Committing is the user's call, not something to do
as part of this skill — if they ask you to commit afterward, that's a separate step. Docs
generated by this skill are logically one concern (the log-to-docs conversion), so unless
the user says otherwise, one commit for all of it is appropriate — don't split it further
than that.
