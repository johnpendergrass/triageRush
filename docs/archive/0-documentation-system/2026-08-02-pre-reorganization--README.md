# Current triageRush Documentation

This folder contains the small, authoritative set of current project
specifications. It describes the repository as a whole: the responsive game,
shared patient data, production artwork, and future standalone Patient CRUD
tool.

There is exactly one current file for each purpose:

```text
ui-specification--YYYY-MM-DD-HHMM.md
gameplay-specification--YYYY-MM-DD-HHMM.md
scoring-specification--YYYY-MM-DD-HHMM.md
patient-data-and-assets--YYYY-MM-DD-HHMM.md
implementation-reference--YYYY-MM-DD-HHMM.md
development-handoff--YYYY-MM-DD-HHMM.md
home-screen-specification--YYYY-MM-DD-HHMM.md
```

The timestamp records when that current version was established. When a
specification changes:

1. Move the outgoing version to `archive/`.
2. Save the revised document here with a new timestamp.
3. Keep the purpose prefix unchanged.
4. Add a concise entry to its change history.

This README does not need updating for timestamp-only revisions. It changes
only when a document purpose or the documentation workflow changes.

Everything under `archive/` is historical and does not override these
current specifications.
