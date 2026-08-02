# Mobile and Desktop Test Apps Separated

Date: 2026-07-28

The pre-production testing phase will use two deliberately independent apps:

- `_testAppMobile/`
- `_testAppDesktop/`

The former `_testApp/` was renamed `_testAppMobile/`. Its existing
self-contained seven-room mobile implementation and old prototype assets are
preserved there as the starting point for the mobile recreation.

`_testAppDesktop/` was created as a new independent scaffold. Mobile code was
not copied into it.

## Boundary

Each test app must have:

- Its own HTML, CSS, and JavaScript
- Its own complete runtime asset copies
- Its own launch script and HTTP server
- No runtime imports from the other test app
- No runtime dependency on the production application or authoritative
  patient-data folders

The mobile test server uses port `8080`. The desktop test server uses port
`8081`, allowing both to run concurrently.

Duplication is intentional during this phase. These apps are final design
tests before the mobile and desktop game designs are settled and production
code development begins. Shared production architecture should not be inferred
or prematurely extracted from the two test implementations.

## Next work

1. Recreate `_testAppMobile/` using copied versions of the new high-resolution
   production assets.
2. Build `_testAppDesktop/` using its own copies of the same approved artwork,
   arranged as a desktop-native interface.
3. Test and refine each independently.
4. Use the two completed demos to settle the actual mobile and desktop designs
   before production application coding begins.

