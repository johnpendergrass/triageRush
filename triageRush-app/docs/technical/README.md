# triageRush Technical Documentation

Current gameplay, interface, accessibility, asset, testing, and patient-data
consumption contracts will live here.

## Current production specifications

- [Strict and forgiving scoring specification](2026%200727%201458%20strict%20and%20forgiving%20scoring%20specification.md)
  defines room identifiers, full- and half-credit behavior, Psych and Discharge
  handling, schema inputs, edge cases, and required implementation tests.

`prototype-reference/` documents the preserved `_testApp/` implementation for
use while rebuilding the production game. It is the easiest starting point for
exact prototype geometry, visual tokens, states, behaviors, and asset metadata.

`transition-reference/` preserves the latest technical documentation from
before the repository restructure. Those files are references for rewriting
the production contract, not automatically approved specifications.
