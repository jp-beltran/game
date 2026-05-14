import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

export type BuildGameProjectContextRequest = {
  message: string
  workspaceRoot: string
}

export type GameProjectContextBuilder = {
  build: (request: BuildGameProjectContextRequest) => Promise<string>
}

type PriorityFileDefinition = {
  path: string
  tags: string[]
  summarize: (content: string) => string
}

type ScoredFile = {
  path: string
  score: number
  tokens: string[]
}

const PRIORITY_FILES: PriorityFileDefinition[] = [
  {
    path: 'src/game/components/World.tsx',
    tags: ['mapa', 'mundo', 'world', 'tile', 'tiles', 'bioma', 'biomas'],
    summarize(content) {
      const details: string[] = []

      if (content.includes('createHexMap')) {
        details.push('mapa hexagonal')
      }

      if (content.includes('Player')) {
        details.push('renderiza o personagem')
      }

      if (content.includes('ThirdPersonCamera')) {
        details.push('acopla a camera')
      }

      return details.length > 0
        ? details.join(', ')
        : 'mundo principal do jogo'
    },
  },
  {
    path: 'src/game/components/Player.tsx',
    tags: ['player', 'personagem', 'animacao', 'animacoes', 'idle', 'walk'],
    summarize(content) {
      const details: string[] = []

      if (
        content.includes('player-model-idle') ||
        content.includes('player-model-walk')
      ) {
        details.push('animacoes idle/walk')
      }

      if (content.includes('shield') || content.includes('helmet')) {
        details.push('modelo do personagem')
      }

      if (content.includes('useFrame')) {
        details.push('animacao em tempo real')
      }

      return details.length > 0
        ? details.join(', ')
        : 'modelo e animacoes do personagem'
    },
  },
  {
    path: 'src/game/components/ThirdPersonCamera.tsx',
    tags: ['camera', 'follow', 'follow-up', 'visao'],
    summarize(content) {
      if (content.includes('camera.lookAt') || content.includes('CAMERA_')) {
        return 'camera em terceira pessoa seguindo o alvo'
      }

      return 'camera do jogo'
    },
  },
  {
    path: 'src/game/components/GameCanvas.tsx',
    tags: ['canvas', 'scene', 'cena', 'render'],
    summarize(content) {
      if (content.includes('usePlayerController') || content.includes('<World')) {
        return 'entrada do canvas e montagem da cena'
      }

      return 'entrada do jogo renderizado'
    },
  },
  {
    path: 'src/game/hooks/usePlayerController.ts',
    tags: ['movimento', 'movement', 'input', 'controle', 'controller'],
    summarize(content) {
      const details: string[] = []

      if (content.includes('queuedDirectionsRef')) {
        details.push('fila de direcoes')
      }

      if (content.includes('startStep') || content.includes('advanceStep')) {
        details.push('passos do personagem')
      }

      return details.length > 0
        ? details.join(', ')
        : 'controle de movimento do personagem'
    },
  },
]

const SEARCH_ROOTS = ['src', 'server']
const CODE_EXTENSIONS = new Set(['.ts', '.tsx'])
const STOP_WORDS = new Set([
  'a',
  'o',
  'os',
  'as',
  'de',
  'do',
  'da',
  'dos',
  'das',
  'e',
  'em',
  'no',
  'na',
  'nos',
  'nas',
  'um',
  'uma',
  'para',
  'por',
  'com',
  'que',
  'ele',
  'ela',
  'isso',
  'isto',
  'jogo',
  'codigo',
  'tambem',
  'mais',
])

const TOKEN_ALIASES: Record<string, string[]> = {
  agente: ['agent'],
  animacao: ['animation', 'idle', 'walk'],
  animacoes: ['animation', 'idle', 'walk'],
  camera: ['camera'],
  chat: ['prompt', 'conversation', 'messages'],
  controle: ['controller', 'input'],
  endpoint: ['api', 'route', 'prompts'],
  mapa: ['map', 'world', 'hex', 'tile'],
  personagem: ['player'],
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function extractTokens(message: string) {
  return Array.from(
    new Set(
      normalizeText(message)
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length >= 3 && !STOP_WORDS.has(token)),
    ),
  )
}

async function readFileIfExists(path: string) {
  try {
    return await readFile(path, 'utf8')
  } catch {
    return null
  }
}

async function collectCodeFiles(root: string, workspaceRoot: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true }).catch(() => [])
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = join(root, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await collectCodeFiles(fullPath, workspaceRoot)))
      continue
    }

    if (!CODE_EXTENSIONS.has(extname(entry.name))) {
      continue
    }

    files.push(relative(workspaceRoot, fullPath))
  }

  return files
}

function matchTokens(
  relPath: string,
  normalizedContent: string,
  tokens: string[],
  extraTags: string[] = [],
): string[] {
  const normalizedPath = normalizeText(relPath)
  const tagSet = extraTags.map((tag) => normalizeText(tag))

  return tokens.filter((token) => {
    const tokenVariants = [token, ...(TOKEN_ALIASES[token] ?? [])].map((variant) =>
      normalizeText(variant),
    )

    return (
      tokenVariants.some((variant) => normalizedPath.includes(variant)) ||
      tokenVariants.some((variant) => normalizedContent.includes(variant)) ||
      tagSet.some((tag) =>
        tokenVariants.some((variant) => tag.includes(variant) || variant.includes(tag)),
      )
    )
  })
}

function scoreFile(
  relPath: string,
  normalizedContent: string,
  tokens: string[],
  extraTags: string[] = [],
): ScoredFile | null {
  const matches = matchTokens(relPath, normalizedContent, tokens, extraTags)

  if (matches.length === 0) {
    return null
  }

  const normalizedPath = normalizeText(relPath)
  const score = matches.reduce((total, token) => {
    const pathBonus = normalizedPath.includes(token) ? 2 : 0
    const contentBonus = normalizedContent.includes(token) ? 1 : 0
    const tagBonus = extraTags.some((tag) => normalizeText(tag).includes(token)) ? 2 : 0

    return total + pathBonus + contentBonus + tagBonus + 1
  }, 0)

  return {
    path: relPath,
    score,
    tokens: matches,
  }
}

function formatScoredFile(file: ScoredFile) {
  return `- ${file.path}: relacionado a ${file.tokens.join(', ')}.`
}

export function createGameProjectContextBuilder(): GameProjectContextBuilder {
  return {
    async build({ message, workspaceRoot }) {
      const tokens = extractTokens(message)
      const prioritySummaries: string[] = []
      const gameMatches: ScoredFile[] = []

      for (const definition of PRIORITY_FILES) {
        const filePath = join(workspaceRoot, definition.path)
        const content = await readFileIfExists(filePath)

        if (!content) {
          continue
        }

        prioritySummaries.push(
          `- ${definition.path}: ${definition.summarize(content)}.`,
        )

        const scored = scoreFile(
          definition.path,
          normalizeText(content),
          tokens,
          definition.tags,
        )

        if (scored) {
          gameMatches.push(scored)
        }
      }

      if (tokens.length > 0) {
        const allGameFiles = await collectCodeFiles(
          join(workspaceRoot, 'src/game'),
          workspaceRoot,
        )

        for (const relPath of allGameFiles) {
          if (PRIORITY_FILES.some((definition) => definition.path === relPath)) {
            continue
          }

          const content = await readFileIfExists(join(workspaceRoot, relPath))

          if (!content) {
            continue
          }

          const scored = scoreFile(relPath, normalizeText(content), tokens)

          if (scored) {
            gameMatches.push(scored)
          }
        }
      }

      const dedupedGameMatches = Array.from(
        new Map(
          gameMatches
            .sort((left, right) => right.score - left.score)
            .map((match) => [match.path, match] as const),
        ).values(),
      ).slice(0, 5)

      const expansionMatches: ScoredFile[] = []

      if (tokens.length > 0 && dedupedGameMatches.length === 0) {
        for (const root of SEARCH_ROOTS) {
          const relPaths = await collectCodeFiles(join(workspaceRoot, root), workspaceRoot)

          for (const relPath of relPaths) {
            if (relPath.startsWith('src/game/')) {
              continue
            }

            const content = await readFileIfExists(join(workspaceRoot, relPath))

            if (!content) {
              continue
            }

            const scored = scoreFile(relPath, normalizeText(content), tokens)

            if (scored) {
              expansionMatches.push(scored)
            }
          }
        }
      }

      const dedupedExpansionMatches = Array.from(
        new Map(
          expansionMatches
            .sort((left, right) => right.score - left.score)
            .map((match) => [match.path, match] as const),
        ).values(),
      ).slice(0, 4)

      return [
        'Contexto automatico do projeto:',
        'Area prioritaria: src/game',
        'Resumo atual do jogo:',
        ...prioritySummaries,
        dedupedGameMatches.length > 0
          ? 'Arquivos mais relacionados ao pedido:'
          : 'Arquivos mais relacionados ao pedido: nenhum match forte; use o resumo base do jogo.',
        ...dedupedGameMatches.map(formatScoredFile),
        dedupedExpansionMatches.length > 0 ? 'Expansao fora do jogo:' : null,
        ...dedupedExpansionMatches.map(formatScoredFile),
      ]
        .filter((line): line is string => Boolean(line))
        .join('\n')
    },
  }
}
