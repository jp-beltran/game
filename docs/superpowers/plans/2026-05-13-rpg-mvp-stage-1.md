# RPG MVP Stage 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the RPG MVP with a clean front-end architecture, minimal 3D scene shell, Admin button shell, and working test/build pipelines.

**Architecture:** The app starts with explicit domain boundaries so later stages can add movement, camera, and admin workflow without mixing responsibilities. Stage 1 keeps behavior intentionally shallow and focuses on a verifiable scaffold with tests first.

**Tech Stack:** React, TypeScript, Vite, React Three Fiber, Three.js, Vitest, React Testing Library, Playwright

---

## File Structure

- `package.json`: dependencies and scripts
- `tsconfig*.json`: TypeScript config for app and node tools
- `vite.config.ts`: Vite + Vitest setup
- `playwright.config.ts`: E2E config
- `src/app/App.tsx`: app composition root
- `src/app/App.test.tsx`: app-level render tests
- `src/game/components/GameCanvas.tsx`: scene shell container
- `src/game/components/World.tsx`: minimal world placeholder
- `src/admin/components/AdminButton.tsx`: visible admin trigger shell
- `src/shared/components/Button.tsx`: basic reusable button wrapper
- `src/test/setup.ts`: RTL setup
- `e2e/app.spec.ts`: smoke E2E

### Task 1: Bootstrap Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`

- [ ] **Step 1: Scaffold Vite React TypeScript baseline**
- [ ] **Step 2: Install runtime and test dependencies**
- [ ] **Step 3: Confirm scripts exist for `dev`, `test`, `test:e2e`, and `build`**

### Task 2: Write Failing Unit Tests

**Files:**
- Test: `src/app/App.test.tsx`

- [ ] **Step 1: Write a test asserting the app heading/shell renders**
- [ ] **Step 2: Write a test asserting the game container appears**
- [ ] **Step 3: Write a test asserting the `Admin` button appears**
- [ ] **Step 4: Run `npm run test -- --run` and confirm failure before implementation**

### Task 3: Minimal UI Implementation

**Files:**
- Create: `src/app/App.tsx`
- Create: `src/game/components/GameCanvas.tsx`
- Create: `src/game/components/World.tsx`
- Create: `src/admin/components/AdminButton.tsx`
- Create: `src/shared/components/Button.tsx`

- [ ] **Step 1: Implement the smallest `App` composition to satisfy tests**
- [ ] **Step 2: Implement a `GameCanvas` shell with a stable test id**
- [ ] **Step 3: Implement a minimal `World` placeholder**
- [ ] **Step 4: Implement a reusable `Button` and `AdminButton`**
- [ ] **Step 5: Re-run unit tests and make them pass**

### Task 4: E2E Smoke Coverage

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/app.spec.ts`

- [ ] **Step 1: Write the smoke E2E first**
- [ ] **Step 2: Run `npm run test:e2e` and confirm failure before final browser wiring**
- [ ] **Step 3: Adjust app/test config minimally until E2E passes**

### Task 5: Verification

**Files:**
- Create: `src/test/setup.ts`
- Create: `.gitignore`

- [ ] **Step 1: Run `npm run test`**
- [ ] **Step 2: Run `npm run test:e2e`**
- [ ] **Step 3: Run `npm run build`**
- [ ] **Step 4: Report exact results and any limitations**
