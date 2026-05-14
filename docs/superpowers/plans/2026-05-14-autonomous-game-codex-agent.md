# Autonomous Game Codex Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the in-game Codex agent read the current game code before each request, infer likely targets in `src/game`, edit directly when the request is clear, and show an in-chat loading state while it is thinking.

**Architecture:** Add a backend-side project-context builder in `server/agent` that inspects priority files under `src/game`, generates a compact summary, and injects that summary into the prompt sent to the local Codex CLI. Update the chat state so the UI renders a transient assistant bubble during in-flight requests and remove the old confirmation-first implementation gate.

**Tech Stack:** Vite, React 19, TypeScript, Vitest, local Codex CLI backend

---

### Task 1: Backend autonomous discovery context

**Files:**
- Create: `server/agent/gameProjectContext.ts`
- Create: `server/agent/gameProjectContext.test.ts`
- Modify: `server/agent/codexAgentAdapter.ts`
- Modify: `server/agent/codexAgentAdapter.test.ts`

- [ ] **Step 1: Write failing tests for automatic project context injection**
- [ ] **Step 2: Run the targeted Vitest command and confirm failure**
- [ ] **Step 3: Implement the context builder and autonomous prompt rules**
- [ ] **Step 4: Run the targeted Vitest command and confirm pass**

### Task 2: Chat loading and implementation feedback

**Files:**
- Modify: `src/admin/components/AdminPanel.tsx`
- Modify: `src/admin/components/PromptConsole.tsx`
- Modify: `src/admin/types/admin.ts`
- Modify: `src/app/App.test.tsx`

- [ ] **Step 1: Write failing tests for the transient assistant loading bubble**
- [ ] **Step 2: Run the targeted Vitest command and confirm failure**
- [ ] **Step 3: Implement the transient loading message and response replacement**
- [ ] **Step 4: Run the targeted Vitest command and confirm pass**

### Task 3: Final verification

**Files:**
- Verify only

- [ ] **Step 1: Run backend and UI targeted tests**
- [ ] **Step 2: Run the full `npm test` suite**
- [ ] **Step 3: Run `npm run build`**
