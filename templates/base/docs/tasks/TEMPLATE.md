# Feature task

## Product outcome

Who needs to do what? What is explicitly out of scope?

## Acceptance criteria

- Successful journey:
- Input boundaries and failures:
- Roles, ownership and private/public data:
- Loading, empty, error and retry states:
- Mobile/keyboard behavior:
- Media/cache impact:

## Implementation

Read AGENTS.md and relevant source. Identify domain/service/repository/UI changes. Specify migrations/configuration and external effects before implementing them. If independent delegation helps, use ../agents/HANDOFF.md to assign file ownership and checks. One integration owner runs the final gate; workers return focused evidence.

## Required evidence

Unit tests for business rules and failures; component tests for meaningful interaction; access tests for private data; browser tests for route journeys. Run npm run check, update docs and report actual results plus remaining setup.
