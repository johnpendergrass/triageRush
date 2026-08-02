# triageRush Technical Documentation

Current gameplay, interface, accessibility, asset, testing, and patient-data
consumption contracts will live here.

## Current production specifications

- [Production gameplay and responsive interface contract](2026%200729%201622%20production%20gameplay%20and%20responsive%20interface%20contract.md)
  records the accepted game composition, responsive frame, HOME/GAME/STATS
  behavior, interaction model, visual direction, production architecture, and
  intentionally deferred decisions at the end of the demo phase.
- [Three-mode scoring specification](2026%200729%201622%20three-mode%20scoring%20specification.md)
  defines Strict, Tolerant, and Forgiving evaluation; asymmetric over-triage
  handling; Psych and Discharge rules; edge cases; and implementation tests.

The earlier `2026 0727 1458` scoring specification and untimed `2026 0729`
interface contract contain John's review annotations and are retained as the
reviewed source records superseded by the current clean specifications.

`prototype-reference/` documents the preserved `_testAppMobile/`
implementation for historical and exact visual reference. It is the
easiest starting point for exact prototype geometry, visual tokens, states,
behaviors, and asset metadata. `_testAppDesktop/` is a separate independent
test app and is not described by that mobile reference specification. Neither
prototype reference overrides the current responsive production contract.

`transition-reference/` preserves the latest technical documentation from
before the repository restructure. Those files are references for rewriting
the production contract, not automatically approved specifications.
