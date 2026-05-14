import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { createGameProjectContextBuilder } from './gameProjectContext'

describe('gameProjectContext', () => {
  it('summarizes the core game files and highlights related player and map files', async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), 'games-context-'))

    await mkdir(join(workspaceRoot, 'src/game/components'), { recursive: true })
    await mkdir(join(workspaceRoot, 'src/game/hooks'), { recursive: true })

    await writeFile(
      join(workspaceRoot, 'src/game/components/World.tsx'),
      'const MAP_RADIUS = 4; function createHexMap() {} <Player /><ThirdPersonCamera target={playerPosition} />',
    )
    await writeFile(
      join(workspaceRoot, 'src/game/components/Player.tsx'),
      "name='player-model-idle'; name='player-model-walk'; const walkCycle = 1; const idleCycle = 1;",
    )
    await writeFile(
      join(workspaceRoot, 'src/game/hooks/usePlayerController.ts'),
      'function startStep() {} function update(delta) {}',
    )

    const builder = createGameProjectContextBuilder()
    const context = await builder.build({
      message: 'melhore a animacao do personagem no mapa',
      workspaceRoot,
    })

    expect(context).toContain('Area prioritaria: src/game')
    expect(context).toContain('src/game/components/Player.tsx')
    expect(context).toContain('animacoes idle/walk')
    expect(context).toContain('src/game/components/World.tsx')
    expect(context).toContain('mapa hexagonal')
  })

  it('expands outside the game area when the request does not match the game files', async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), 'games-context-'))

    await mkdir(join(workspaceRoot, 'src/game/components'), { recursive: true })
    await mkdir(join(workspaceRoot, 'server/http'), { recursive: true })

    await writeFile(
      join(workspaceRoot, 'src/game/components/Player.tsx'),
      "name='player-model-idle';",
    )
    await writeFile(
      join(workspaceRoot, 'server/http/adminAgentApi.ts'),
      'export function adminAgentApiHandler() { return "/api/admin/agent/prompts" }',
    )

    const builder = createGameProjectContextBuilder()
    const context = await builder.build({
      message: 'ajuste o endpoint do chat do agente',
      workspaceRoot,
    })

    expect(context).toContain('src/game/components/Player.tsx')
    expect(context).toContain('server/http/adminAgentApi.ts')
    expect(context).toContain('Expansao fora do jogo')
  })
})
