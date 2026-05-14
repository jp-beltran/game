# RPG Diorama Styling Design

## Scope

Refinar apenas a apresentação visual do jogo em `/games`, sem alterar o fluxo do Admin e sem introduzir assets externos.

O foco desta etapa é:

- transformar a cena em um diorama medieval compacto
- substituir o placeholder do jogador por um cavaleiro minimalista em primitivas
- melhorar enquadramento, luz e fundo para sensação de miniatura de mesa
- polir a casca visual geral do canvas e do overlay de debug

Fica fora de escopo:

- mudanças funcionais no painel Admin
- integração de `.glb`
- novas mecânicas de jogo
- revisão da lógica de movimento

## Direction

O mundo deve parecer uma maquete jogável: base contida, bordas construídas, leitura clara de praça central e poucos volumes com silhueta forte.

O personagem deve seguir uma linguagem seca e minimalista, mais próximo de uma miniatura de tabuleiro do que de um herói detalhado.

## Implementation Shape

- `World` passa a montar a praça, casas e limites em blocos simples com cores sólidas lavadas.
- `Player` passa a compor um cavaleiro por primitivas, mantendo o contrato atual de posição e `onFrame`.
- `ThirdPersonCamera` ajusta o enquadramento para um ângulo mais alto e suave.
- `index.css` reforça a apresentação geral do jogo e do overlay sem redesenhar o Admin.

## Acceptance

- a cena deixa de ser um plano vazio com um único placeholder
- o jogador tem silhueta visualmente legível de cavaleiro minimalista
- o enquadramento reforça leitura de diorama compacto
- a UI global do jogo conversa com a direção medieval clean sem tocar no Admin
