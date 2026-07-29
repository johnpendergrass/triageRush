# triageRush Technical Documentation

Current gameplay, interface, accessibility, asset, testing, and patient-data
consumption contracts will live here.

## Current production specifications

- [Production gameplay and responsive interface contract](2026%200729%20production%20gameplay%20and%20responsive%20interface%20contract.md)
  records the accepted game composition, responsive frame, HOME/GAME/STATS
  behavior, interaction model, visual direction, production architecture, and
  intentionally deferred decisions at the end of the demo phase.
- [Strict and forgiving scoring specification](2026%200727%201458%20strict%20and%20forgiving%20scoring%20specification.md)
  defines room identifiers, full- and half-credit behavior, Psych and Discharge
  handling, schema inputs, edge cases, and required implementation tests.

`prototype-reference/` documents the preserved `_testAppMobile/`
implementation for historical and exact visual reference. It is the
easiest starting point for exact prototype geometry, visual tokens, states,
behaviors, and asset metadata. `_testAppDesktop/` is a separate independent
test app and is not described by that mobile reference specification. Neither
prototype reference overrides the current responsive production contract.

`transition-reference/` preserves the latest technical documentation from
before the repository restructure. Those files are references for rewriting
the production contract, not automatically approved specifications.
