# RPG Diorama Styling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a cena atual em um diorama medieval compacto e refinar o placeholder do jogador sem alterar o Admin.

**Architecture:** A estilização fica concentrada em `World`, `Player`, `ThirdPersonCamera` e `index.css`. A validação cobre estrutura renderizada e sinais visuais estáveis via testes de componentes, sem tentar testar pixels.

**Tech Stack:** React, TypeScript, React Three Fiber, Vitest, Testing Library

---

### Task 1: Cobrir a nova estrutura visual com testes

**Files:**
- Modify: `src/game/components/Player.test.tsx`
- Modify: `src/game/components/GameCanvas.test.tsx`

- [ ] **Step 1: Write the failing tests**
- [ ] **Step 2: Run the targeted tests to verify they fail**
- [ ] **Step 3: Implement the minimal visual structure**
- [ ] **Step 4: Re-run the targeted tests to verify they pass**

### Task 2: Implementar o diorama e o cavaleiro minimalista

**Files:**
- Modify: `src/game/components/Player.tsx`
- Modify: `src/game/components/World.tsx`
- Modify: `src/game/components/ThirdPersonCamera.tsx`

- [ ] **Step 1: Refine o cavaleiro em primitivas reutilizando o contrato existente**
- [ ] **Step 2: Monte a praça com bordas, casas e cercas em `World`**
- [ ] **Step 3: Ajuste enquadramento e seguimento da câmera**

### Task 3: Polir a apresentação geral

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Reforçar fundo, moldura do canvas e overlay de debug**
- [ ] **Step 2: Garantir que o Admin continue intacto**

### Task 4: Verificação final

**Files:**
- Modify: `src/game/components/Player.test.tsx`
- Modify: `src/game/components/GameCanvas.test.tsx`

- [ ] **Step 1: Run `npm run test -- src/game/components/Player.test.tsx src/game/components/GameCanvas.test.tsx`**
- [ ] **Step 2: Run `npm run test`**
- [ ] **Step 3: Run `npm run build`**
