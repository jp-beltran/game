# Agente Autonomo do Jogo Design

## Objetivo

Fazer o chat do Codex dentro do jogo agir com mais autonomia: ler automaticamente os arquivos centrais de `src/game` a cada pedido, montar um resumo curto do estado atual do jogo, inferir o alvo mais provavel quando a instrucao vier vaga e editar direto quando a solicitacao parecer clara.

## Backend

O backend do agente passa a executar uma etapa de descoberta antes de chamar o Codex CLI. Essa etapa prioriza `src/game`, le arquivos-base do jogo e tenta localizar arquivos relacionados ao pedido por nomes e termos proximos. O resultado vira um bloco de contexto curto no prompt final.

O agente deixa de depender de confirmacao explicita para implementar. Ele recebe autonomia para editar o workspace quando o pedido indicar mudanca no jogo ou no codigo. Quando houver mais de um alvo plausivel, ele deve escolher o mais provavel e declarar a suposicao na resposta.

## Frontend

O chat passa a mostrar um estado de pensamento dentro da propria conversa. Ao enviar a mensagem, a UI renderiza imediatamente uma bolha temporaria do Codex indicando que ele esta analisando o jogo e implementando a mudanca. Quando a resposta final chega, a bolha temporaria some e a mensagem real entra no historico.

## Regras principais

- Priorizar `src/game` antes de expandir a busca para o resto do repositorio.
- Tratar mapa, personagem, animacoes, camera e input como conceitos de primeira classe na descoberta.
- Manter o endpoint local sincrono; o feedback de progresso fica no frontend.
- Preservar o historico do chat continuo.
