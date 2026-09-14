---
name: refresh-design
description: Re-pull the local design-reference/ mirror of the "Kit Design System" claude.ai/design project so Claude Code sees edits made there. Use when the user says the design system changed, asks to refresh/sync/re-pull the design reference, or mentions specific cards/tokens/components they just updated in Claude Design.
user-invocable: true
---

# Refresh design reference

`design-reference/` (repo root, gitignored) is a local, read-only mirror of the
**"Kit Design System"** project at claude.ai/design — pulled via the `DesignSync`
tool's `get_file`/`list_files` methods, not the design-sync build/upload skill.
There is no automatic sync: the user edits the project in Claude Design, then
asks Claude Code to refresh. This skill is that refresh.

Read `design-reference/INDEX.md` first — it documents what was pulled, what
was deliberately skipped, and any known corrections/staleness notes from the
last pull. Update it at the end if this run changes any of that.

## 1. Resolve the project

Last known: `projectId "5c977035-2b40-4acc-9a10-88c82b2eecff"`, name **"Kit Design System"**.
If `DesignSync` isn't loaded yet, `ToolSearch(query: "select:DesignSync")` first.

`DesignSync(method: "get_project", projectId: "5c977035-2b40-4acc-9a10-88c82b2eecff")` to confirm it
still exists and is `PROJECT_TYPE_DESIGN_SYSTEM`. If that fails (renamed/deleted),
`DesignSync(method: "list_projects")` and ask the user which project to use instead —
don't guess. If a different project is confirmed, update the projectId noted here
and in `design-reference/INDEX.md`.

## 2. Scope the pull

**If the user named specific things that changed** (a component, a token
category, a guideline card), map them to paths and re-fetch just those — don't
do a full pull. Known path groups from the last full pull:

| User says... | Paths |
|---|---|
| colors / palette | `guidelines/color-*.card.html`, `tokens/colors.css` |
| type / typography / fonts | `guidelines/type-*.card.html`, `tokens/typography.css` |
| spacing | `guidelines/spacing-*.card.html`, `tokens/spacing.css` |
| radius / elevation / shadows | `guidelines/radius.card.html`, `guidelines/elevation.card.html`, `tokens/radius-elevation.css` |
| motion / transitions | `guidelines/motion.card.html`, `tokens/motion.css` |
| focus / press states | `guidelines/focus.card.html` |
| brand / logo / cards | `guidelines/brand-mark.card.html`, `guidelines/brand-paper.card.html` |
| icons / iconography | `guidelines/iconography.card.html`, `components/core/Icon.*` |
| a component name (e.g. "checkbox", "select", "button") | `components/core/<Name>.*` or `components/forms/<Name>.*` or `components/proposed/<Name>.*` — **check `list_files` first**, since a component's group can change (e.g. Checkbox moved from `proposed/` to `forms/` once it shipped) |
| "everything" / general "refresh" / no specifics given | full re-pull, below |

For a named component, always `DesignSync(list_files)` first to find its
*current* path — don't assume it's still in the group this mirror last saw it
in.

## 3. Full re-pull (no specific scope given)

1. `DesignSync(list_files, projectId)` for the authoritative current file list.
2. Compare against the local `design-reference/` tree (everything under it
   except `INDEX.md`, which is locally authored, not pulled).
3. For every remote path that has a local counterpart already tracked (see
   the "pulled" list in `INDEX.md`), `get_file` and overwrite the local file
   unconditionally — these calls are cheap and idempotent, there's no hash
   to diff against, so don't try to skip unchanged files.
4. For every remote path with no local file yet, `get_file` and write it —
   but only within the categories `INDEX.md` says were pulled (guidelines,
   tokens, reference, components/core, components/forms, components/proposed,
   components/kit.css, styles.css, readme.md, _adherence.oxlintrc.json). If a
   remote file appears in a category `INDEX.md` lists as "not pulled" (e.g.
   `tokens/figma/*`, `assets/spec-vectors/*`, `ui_kits/spec-sheet/*`,
   `templates/kit-form/*`), leave it alone — don't expand scope silently.
5. For every local file whose remote counterpart is gone (moved or deleted),
   remove the local file. A move (e.g. `proposed/Checkbox.jsx` →
   `forms/Checkbox.jsx`) shows up as one remote path disappearing and a new
   one appearing — write the new location, delete the old one, and update any
   cross-references in `readme.md`'s local copy if you kept one.

## 4. Report concretely, then update INDEX.md

Don't just say "refreshed." List what actually changed: files updated, files
added, files removed, and call out anything structurally different (a
component's group changed, a new component appeared, a status label like
"Proposed — not built" flipped). If nothing changed, say that plainly.

If this run surfaced something `INDEX.md`'s "Known corrections" section
already flagged (e.g. the Checkbox staleness note), and the fresh pull shows
it's now fixed upstream, remove that note — it's resolved. If it surfaces a
*new* discrepancy worth remembering, add a note there the same way.
