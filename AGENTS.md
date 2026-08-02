# Codex Working Agreements

## Session handoffs

- Whenever John asks to commit or push changes, ask whether he would also like
  a session handoff document created or updated before committing. Do not
  create one automatically unless John requests it.
- When John explicitly requests a handoff document, create or update it before
  the commit or push unless he directs otherwise.
- A handoff must summarize:
  - work completed during the session;
  - important decisions and their rationale;
  - files materially changed;
  - verification performed and any remaining concerns;
  - unresolved questions and TODOs; and
  - the recommended starting direction for the next session.
- Clearly distinguish approved decisions from proposals, questions, and
  unimplemented TODOs.
- Follow the repository documentation workflow for current specifications:
  - name the current handoff
    `docs/development-handoff--YYYY-MM-DD-HHMM.md`;
  - move the outgoing current handoff to `docs/archive/`;
  - add a concise change-history entry; and
  - do not treat historical files in `docs/archive/` as current instructions.
- Before writing a handoff, inspect the working tree and the relevant current
  documentation so the handoff reflects the actual repository state rather
  than conversation memory alone.
