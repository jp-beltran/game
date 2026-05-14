# Codex Floating Chat Confirmation Design

## Objetivo

Transformar o Admin atual em um chat flutuante simples dentro da tela do jogo, onde:

- o usuário escreve uma pergunta em uma caixa de texto fixa no canto da tela;
- o Codex responde como uma IA normal no mesmo painel;
- a resposta aparece logo abaixo no fluxo da conversa;
- se a resposta propuser uma implementação, o próprio texto pede confirmação;
- se a próxima mensagem do usuário for uma afirmação simples como `sim`, `ok` ou `manda ver`, o backend interpreta isso como autorização para implementar.

## Fora de escopo

Esta etapa não precisa:

- manter `read-only` no front-end;
- expor `role` no payload do chat;
- manter o modal atual;
- criar um sistema complexo de sessões persistidas no backend;
- suportar múltiplos fluxos paralelos de confirmação.

## Experiência desejada

O painel deve sair do modelo de modal bloqueante e virar uma caixa flutuante ancorada no canto da tela, preferencialmente no canto inferior direito em desktop e responsiva em mobile.

Comportamento esperado:

1. O usuário digita uma mensagem.
2. A mensagem entra no histórico do chat.
3. O backend recebe a nova mensagem junto com o histórico recente.
4. O Codex responde como conversa normal.
5. Se a resposta implicar mudança de código, ela pede confirmação em linguagem natural.
6. Se o usuário responder algo afirmativo simples, o backend trata isso como autorização e dispara a implementação.
7. O resultado da implementação volta no mesmo chat.

## Arquitetura

### Front-end

O front passa a ter um único painel flutuante com:

- lista de mensagens da conversa;
- textarea fixa na base do painel;
- botão de envio;
- indicador simples de status (`idle`, `submitting`, `success`, `error`).

Estado mínimo sugerido:

- `messages[]`
- `input`
- `status`
- `pendingConfirmation`

O histórico deve ser visualmente estilo chat, sem separar “resposta atual” de “histórico de prompts” como blocos diferentes.

### Backend

O backend local continua responsável por chamar o Codex CLI.

Fluxo:

```txt
FloatingChat
  -> codexAgentService.sendMessage()
    -> POST /api/admin/agent/prompts
      -> backend local
        -> adapter do Codex
          -> Codex CLI local
```

O backend recebe a nova mensagem e o histórico da conversa, repassa isso ao adapter e retorna uma única resposta textual do Codex.

O backend também decide se a última resposta ficou aguardando confirmação. Se a nova mensagem for uma afirmação simples e houver ação pendente, ele troca o comportamento de “conversa” para “executar implementação”.

## Contrato simplificado

### Request

```json
{
  "message": "quero adicionar inventário",
  "conversation": [
    { "content": "mensagem anterior" },
    { "content": "resposta anterior" }
  ]
}
```

### Response

```json
{
  "id": "string",
  "status": "completed",
  "message": "resposta do Codex",
  "pendingConfirmation": true
}
```

## Regras de confirmação

Mensagens simples como estas devem ser tratadas como confirmação positiva:

- `sim`
- `ok`
- `manda ver`

Essa detecção deve acontecer no backend, não no front-end, para o browser não controlar a regra crítica de autorização.

## Decisões de simplicidade

- O front envia apenas `message` e `conversation`.
- O backend pode ser stateless nesta etapa.
- O contexto da conversa pode ser reenviado a cada request.
- A primeira versão pode usar heurística simples para identificar confirmações afirmativas.
- O layout deve priorizar clareza e rapidez de uso, não uma UI pesada.

## Critérios de aceite

- O modal deixa de existir.
- O painel vira uma caixa flutuante dentro da tela.
- A conversa aparece em formato de chat contínuo.
- A resposta do Codex aparece no mesmo fluxo, logo abaixo da pergunta.
- O backend recebe histórico da conversa.
- O backend reconhece confirmações afirmativas simples.
- O frontend continua funcional.
- Testes e build continuam passando.
