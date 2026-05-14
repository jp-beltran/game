# Codex CLI Local Agent Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the Admin Panel with the local Codex CLI through the backend so a prompt can return a synchronous textual response while preserving a safe front-end/backend split.

**Architecture:** The front-end keeps a switchable `mock | local` service, but the real execution path moves entirely to the backend adapter. The backend validates the payload, maps `executionMode` to Codex CLI sandbox flags, invokes `codex exec` synchronously, and returns the final response text to the Admin Panel.

**Tech Stack:** React, TypeScript, Vite middleware, Node HTTP, child_process, Vitest, Playwright

---

## File Structure

- `src/admin/types/admin.ts`: request/response contract, execution mode, prompt history shape
- `src/admin/components/AdminPanel.tsx`: selected execution mode and response handling
- `src/admin/components/PromptConsole.tsx`: UI for mode selection and agent response
- `src/admin/services/codexAgentService.ts`: front-end request payload and mode switching
- `server/http/adminAgentApi.ts`: payload validation and completed-response contract
- `server/agent/codexAgentAdapter.ts`: Codex CLI adapter
- `server/agent/codexCliRunner.ts`: isolated process runner for `codex exec`
- `src/admin/services/codexAgentService.test.ts`: service contract tests
- `src/app/App.test.tsx`: integration behavior with mocked service
- `server/http/adminAgentApi.test.ts`: endpoint validation tests
- `server/agent/codexAgentAdapter.test.ts`: CLI adapter tests
- `e2e/app.spec.ts`: Admin Panel flow expectation

### Task 1: Lock New Contract With Tests

**Files:**
- Modify: `src/admin/services/codexAgentService.test.ts`
- Modify: `src/app/App.test.tsx`
- Modify: `server/http/adminAgentApi.test.ts`
- Create: `server/agent/codexAgentAdapter.test.ts`

- [ ] **Step 1: Write failing tests for `executionMode` in service and endpoint payloads**
- [ ] **Step 2: Write failing tests for synchronous `completed` responses with real agent text**
- [ ] **Step 3: Write failing adapter tests for Codex CLI argument mapping and error handling**
- [ ] **Step 4: Run focused tests and confirm failure before implementation**

### Task 2: Implement Front-End Contract

**Files:**
- Modify: `src/admin/types/admin.ts`
- Modify: `src/admin/components/AdminPanel.tsx`
- Modify: `src/admin/components/PromptConsole.tsx`
- Modify: `src/admin/services/codexAgentService.ts`

- [ ] **Step 1: Add `executionMode` to the request/response model**
- [ ] **Step 2: Add a read-only/workspace-write control in the Admin Panel**
- [ ] **Step 3: Return and render the agent response text in the panel/history**
- [ ] **Step 4: Re-run front-end tests and make them pass**

### Task 3: Implement Real Backend Execution

**Files:**
- Modify: `server/http/adminAgentApi.ts`
- Modify: `server/agent/codexAgentAdapter.ts`
- Create: `server/agent/codexCliRunner.ts`

- [ ] **Step 1: Validate `executionMode` in the backend payload**
- [ ] **Step 2: Implement an injectable Codex CLI runner using `codex exec`**
- [ ] **Step 3: Map `read-only` and `workspace-write` to the correct Codex sandbox mode**
- [ ] **Step 4: Return `completed` with the final agent message, and surface runner failures clearly**

### Task 4: Verify Full Behavior

**Files:**
- Modify: `e2e/app.spec.ts`

- [ ] **Step 1: Update E2E expectation for the completed-response UI**
- [ ] **Step 2: Run `npm run test`**
- [ ] **Step 3: Run `npm run test:e2e`**
- [ ] **Step 4: Run `npm run build` and report exact results**
