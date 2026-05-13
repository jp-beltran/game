# RPG MVP Stage 1 Design

## Scope

Stage 1 covers only project bootstrap and the minimum architectural shell for the RPG MVP:

- Vite + React + TypeScript application setup
- React Three Fiber canvas shell
- Minimal world placeholder with a ground plane
- Visible `Admin` button without the functional panel yet
- Vitest + React Testing Library setup
- Playwright setup with one smoke E2E

Stage 1 explicitly excludes:

- Player movement logic
- Third-person camera behavior
- Keyboard input hooks
- Functional admin prompt flow
- Backend or agent integration

## Architecture

The app is split into `app`, `game`, `admin`, and `shared` domains from the beginning so later stages can add logic without reshaping the project.

- `src/app`: composition root
- `src/game`: 3D scene shell and future game logic
- `src/admin`: admin entrypoints and future prompt UI
- `src/shared`: reusable UI primitives
- `e2e`: browser-level smoke coverage

## Acceptance For Stage 1

- Application renders
- Game container/canvas shell renders
- `Admin` button renders
- Smoke E2E opens the home page and sees the main UI
- `npm run test`, `npm run test:e2e`, and `npm run build` are available
