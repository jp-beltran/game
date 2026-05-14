import { spawn } from 'node:child_process'

import type { CodexExecutionMode } from '../../src/admin/types/admin'

export type CodexCliRunRequest = {
  executionMode: CodexExecutionMode
  prompt: string
  signal?: AbortSignal
  timeoutMs: number
  workspaceRoot: string
}

export type CodexCliRunner = {
  run: (request: CodexCliRunRequest) => Promise<string>
}

type CreateCodexCliRunnerOptions = {
  binaryPath?: string
}

export function createCodexCliRunner({
  binaryPath = process.env.CODEX_CLI_BIN ?? 'codex',
}: CreateCodexCliRunnerOptions = {}): CodexCliRunner {
  function extractAgentMessage(stdout: string): string {
    let lastAgentMessage = ''

    for (const line of stdout.split(/\r?\n/)) {
      const trimmedLine = line.trim()

      if (!trimmedLine.startsWith('{')) {
        continue
      }

      try {
        const parsedLine = JSON.parse(trimmedLine) as {
          item?: { text?: string; type?: string }
          type?: string
        }

        if (
          parsedLine.type === 'item.completed' &&
          parsedLine.item?.type === 'agent_message' &&
          typeof parsedLine.item.text === 'string'
        ) {
          lastAgentMessage = parsedLine.item.text.trim()
        }
      } catch {
        continue
      }
    }

    return lastAgentMessage
  }

  return {
    async run({
      executionMode,
      prompt,
      signal,
      timeoutMs,
      workspaceRoot,
    }: CodexCliRunRequest): Promise<string> {
      return new Promise((resolve, reject) => {
        const args = [
          'exec',
          '--json',
          '--color',
          'never',
          '-s',
          executionMode,
          '-C',
          workspaceRoot,
          prompt,
        ]

        const childProcess = spawn(binaryPath, args, {
          cwd: workspaceRoot,
          env: process.env,
          stdio: ['pipe', 'pipe', 'pipe'],
        })
        let isSettled = false
        let stdout = ''
        let stderr = ''
        const abortHandler = () => {
          if (isSettled) {
            return
          }

          isSettled = true
          clearTimeout(timeoutHandle)
          childProcess.kill('SIGTERM')
          reject(new DOMException('Aborted', 'AbortError'))
        }
        const timeoutHandle = setTimeout(() => {
          if (isSettled) {
            return
          }

          isSettled = true
          signal?.removeEventListener('abort', abortHandler)
          childProcess.kill('SIGTERM')
          reject(new Error(`Codex CLI excedeu o timeout de ${timeoutMs}ms.`))
        }, timeoutMs)

        if (signal?.aborted) {
          abortHandler()
          return
        }

        signal?.addEventListener('abort', abortHandler, { once: true })
        childProcess.stdin.end()
        childProcess.stdout.on('data', (chunk: Buffer | string) => {
          stdout += chunk.toString()
        })
        childProcess.stderr.on('data', (chunk: Buffer | string) => {
          stderr += chunk.toString()
        })

        childProcess.on('error', (error) => {
          if (isSettled) {
            return
          }

          isSettled = true
          clearTimeout(timeoutHandle)
          signal?.removeEventListener('abort', abortHandler)
          reject(error)
        })

        childProcess.on('close', (code) => {
          if (isSettled) {
            return
          }

          isSettled = true
          clearTimeout(timeoutHandle)
          signal?.removeEventListener('abort', abortHandler)

          if (code !== 0) {
            reject(
              new Error(
                stderr.trim() ||
                  stdout.trim() ||
                  `Codex CLI encerrou com código ${code}.`,
              ),
            )
            return
          }

          const response = extractAgentMessage(stdout)

          if (!response) {
            reject(new Error('Codex CLI retornou uma resposta vazia.'))
            return
          }

          resolve(response)
        })
      })
    },
  }
}
