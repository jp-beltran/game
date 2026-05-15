# Games

Protótipo de jogo 3D em React + Three.js com um painel admin flutuante que envia pedidos para um agente local via Codex CLI.

## O que existe hoje

- Mundo hexagonal renderizado com `@react-three/fiber`
- Controle de movimento do personagem por teclado
- Câmera em terceira pessoa
- Fog of war baseado na posição atual do jogador
- Cenário procedural simples com tiles, árvores e tufos de grama
- Painel admin flutuante com histórico contínuo de conversa
- Backend local acoplado ao Vite para encaminhar prompts ao Codex CLI
- Cobertura de testes para partes do front e do backend local

## Stack

- React 19
- TypeScript
- Vite
- Three.js
- `@react-three/fiber` e `@react-three/drei`
- Vitest
- Playwright

## Estrutura principal

```text
src/
  app/                    composição da aplicação
  game/                   canvas, mundo, jogador, câmera, input e regras do mapa
  admin/                  painel flutuante, serviço HTTP e tipos do chat
server/
  agent/                  montagem de contexto e execução do Codex CLI
  http/                   endpoint local e plugin do Vite
public/
  Knight Character...     asset `.glb` do personagem
```

## Como rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Subir o projeto

```bash
npm run dev
```

O Vite sobe a interface e também registra o endpoint local do admin agent via plugin em `server/http/viteAdminAgentPlugin.ts`.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run test
npm run test:watch
npm run test:e2e
```

## Fluxo do agent local

O chat admin do jogo usa este fluxo:

1. O front envia a mensagem para `POST /api/admin/agent/prompts`
2. O handler em `server/http/adminAgentApi.ts` valida payload, tamanho e abort
3. O adapter em `server/agent/codexAgentAdapter.ts` monta o prompt com contexto do projeto e histórico recente
4. O runner em `server/agent/codexCliRunner.ts` executa `codex exec --json`
5. A última `agent_message` do CLI volta para o painel flutuante

Arquivos centrais desse fluxo:

- [src/admin/components/AdminPanel.tsx](./src/admin/components/AdminPanel.tsx)
- [src/admin/services/codexAgentService.ts](./src/admin/services/codexAgentService.ts)
- [server/http/adminAgentApi.ts](./server/http/adminAgentApi.ts)
- [server/agent/codexAgentAdapter.ts](./server/agent/codexAgentAdapter.ts)
- [server/agent/codexCliRunner.ts](./server/agent/codexCliRunner.ts)

## Pré-requisitos do Codex CLI

Para o chat admin funcionar de ponta a ponta, o binário `codex` precisa estar disponível no ambiente.

### Configuração rápida

1. Confirme que o Codex CLI está instalado:

```bash
codex --version
```

2. Se o comando `codex` já existir no `PATH`, rode o projeto normalmente:

```bash
npm run dev
```

3. Se o binário estiver em outro caminho, exporte `CODEX_CLI_BIN` antes de subir o Vite:

```bash
export CODEX_CLI_BIN="/caminho/para/codex"
npm run dev
```

4. Se quiser aumentar ou reduzir o tempo limite da execução do agente:

```bash
export CODEX_AGENT_TIMEOUT_MS=180000
npm run dev
```

### Como essa config funciona

Hoje essas variáveis são lidas no backend local do Vite via `process.env`:

- `server/agent/codexCliRunner.ts` lê `CODEX_CLI_BIN`
- `server/agent/codexAgentAdapter.ts` lê `CODEX_AGENT_TIMEOUT_MS`

Por isso, a configuração precisa existir no mesmo shell que inicia `npm run dev`.

### Variáveis suportadas

- `CODEX_CLI_BIN`: caminho ou nome do executável do Codex CLI
- `CODEX_AGENT_TIMEOUT_MS`: timeout da execução do agente em milissegundos

Se o CLI não estiver instalado, o jogo ainda abre normalmente, mas as mensagens do painel admin falham quando enviadas.

## Arquitetura do jogo

- `src/app/App.tsx` compõe `GameCanvas` e `AdminPanel`
- `src/game/components/GameCanvas.tsx` cria o `Canvas` e injeta o overlay admin
- `src/game/hooks/usePlayerController.ts` controla fila de movimento, interpolação e direção do personagem
- `src/game/components/World.tsx` desenha o mapa hexagonal, a vegetação e a névoa
- `src/game/fog-of-war/getVisibleTiles.ts` resolve as células visíveis

## Assets

O personagem atual usa o arquivo:

- `public/Knight Character Animated by Quaternius/knight_animated.glb`

Referência e observações do asset:

- [public/Knight Character Animated by Quaternius/README_ASSET.md](./public/Knight%20Character%20Animated%20by%20Quaternius/README_ASSET.md)

## Testes

Os testes unitários cobrem partes do jogo, do painel admin e do backend local.

```bash
npm run test
```

Os testes e2e ficam separados:

```bash
npm run test:e2e
```

## Estado atual do projeto

Este repositório já passou da fase de template inicial e hoje está mais próximo de um laboratório para:

- experimentar mecânicas de RPG em terceira pessoa
- validar integração local entre UI do jogo e Codex CLI
- iterar rapidamente na camada visual e no fluxo do agente
