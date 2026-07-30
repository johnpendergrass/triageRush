# Demo Milestone and Production Direction

**Recorded:** 2026-07-29

**Milestone:** Mobile and desktop exploration complete; production work next

## What the demos established

Two self-contained test apps were used to settle the principal game loop,
seven-room interface, patient presentation, queue behavior, touch/mouse
interaction, feedback, recall, Coach, visual language, high-resolution artwork,
and responsive questions.

The mobile demo remains the strongest reference for the accepted game-screen
composition. The desktop demo proved that the same game can run responsively
and helped evaluate expanded desktop arrangements.

## Final responsive conclusion

Production will be one responsive application, not separate mobile and desktop
games.

The desktop demo's multi-column expanded arrangement is not the chosen
production layout. Production keeps the mobile-derived game composition:

- One-column waiting queue
- Central patient presentation
- One-column seven-room rail
- Header above and controls below

The centered game uses available browser height and retains a constrained
mobile-like width. Wide-screen space becomes symmetrical optional regions for
HOME on the left and STATS on the right. Opening either region never moves the
game away from the center, and both may be open simultaneously.

At compact sizes, HOME, GAME, and STATS are separate full-frame views. At wide
sizes, HOME and STATS may open beside the live game. Gameplay continues while
they are open unless a confirmed gameplay-setting change requires restart.

The footer direction is:

```text
<-- HOME        COACH        STATS -->
```

## Important deferred design work

- Exact responsive dimensions and breakpoints
- Complete HOME/settings organization
- Exact STATS contents and retained data
- Final scoring, timing, and round-end details
- Persistence
- Clinical and accessibility review

These are deliberate next-stage decisions, not omissions to fill by copying
prototype behavior.

## Production boundary

The demos are now reference artifacts. The next development commit after this
milestone should begin the real implementation under `triageRush-app/` and
should receive a new version tag when that starting boundary is intentionally
chosen.

The complete current contract is:

- [Production gameplay and responsive interface contract](../../technical/2026%200729%20production%20gameplay%20and%20responsive%20interface%20contract.md)
