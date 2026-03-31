# TODO

## Prioridade Alta

- Implementar controle de estoque real no fechamento do pedido.
  - Porque: sem controle quantitativo no momento da compra, dois pedidos podem consumir o mesmo estoque.
  - Como resolver: validar e decrementar estoque dentro da mesma transação de criação do pedido.
- Validar quantidade disponível antes de criar o pedido.
- Baixar estoque de forma transacional para evitar oversell.
- Congelar o preço final do item no momento da compra.
  - Porque: o histórico do pedido não pode mudar quando o preço do produto for alterado depois.
  - Como resolver: persistir `unitPrice`, desconto aplicado e subtotal no item do pedido.
- Garantir que descontos aplicados no pedido não dependam do preço atual do produto.
- Validar se a variante enviada no carrinho existe nas opções do produto.
  - Porque: hoje é possível receber uma combinação arbitrária de chave/valor sem garantir que ela pertence ao catálogo.
  - Como resolver: comparar a variante enviada com as `options` e `values` cadastradas no produto antes de salvar.
- Impedir combinações de variantes inválidas.
- Definir transições válidas para status de pedido.
  - Porque: sem uma máquina de estados, o pedido pode pular entre estados incoerentes, como voltar de `delivered` para `intransit`.
  - Como resolver: criar uma tabela clara de transições permitidas e validar toda mudança de status contra ela.
- Impedir cancelamento ou edição de pedido fora dos estados permitidos.

## Prioridade Média

- Restringir review para usuários que realmente compraram o produto.
  - Porque: review sem compra reduz confiança e distorce rating.
  - Como resolver: exigir pelo menos um pedido elegível do usuário contendo o produto antes de aceitar a avaliação.
- Impedir múltiplas reviews indevidas para o mesmo produto no mesmo contexto de compra.
- Definir regra de quando um produto pode ou não ser removido.
  - Porque: remover produto com histórico pode quebrar rastreabilidade e relatórios.
  - Como resolver: definir se o produto será arquivado, ocultado ou removido fisicamente dependendo do vínculo com pedidos.
- Definir regra de quando uma categoria pode ou não ser removida.
- Avaliar onde usar soft delete em vez de remoção física.
  - Porque: alguns registros precisam sair da operação sem perder histórico.
  - Como resolver: aplicar soft delete em entidades com impacto histórico e manter delete físico só em dados descartáveis.
- Garantir regra equivalente de item padrão para cartões, se fizer parte do domínio.
- Estruturar melhor regras de promoção: vigência, prioridade e combinação de descontos.
  - Porque: promoções sem precedência clara geram cobrança inconsistente.
  - Como resolver: modelar vigência, elegibilidade, prioridade e compatibilidade entre promoções no domínio.

## Prioridade Baixa

- Limitar sessões simultâneas por usuário, se necessário.
- Registrar trilha de auditoria para login, logout e reset de senha.
  - Porque: ações sensíveis sem rastreabilidade dificultam suporte e investigação de incidente.
  - Como resolver: registrar evento, usuário, data, IP e contexto mínimo de cada ação sensível.
- Permitir invalidação global de sessões por usuário.
- Definir regras de frete por endereço, região ou faixa de valor.
- Estruturar fluxo de pagamento com confirmação, falha e estorno.
  - Porque: pedido sem ciclo de pagamento bem definido tende a gerar inconsistência entre status financeiro e status operacional.
  - Como resolver: separar estados de pagamento dos estados do pedido e integrar confirmação/estorno de forma explícita.
- Avaliar necessidade de antifraude no fluxo de pedido.

## Por Módulo

### Auth

- Definir política de múltiplas sessões simultâneas.
- Adicionar auditoria de eventos sensíveis.
- Definir invalidação global de sessões.

### Users

- Definir se existe conceito de cartão principal.
- Revisar onde deve existir soft delete.

### Products

- Validar variantes contra opções cadastradas.
- Definir política de remoção e arquivamento de produtos.
- Definir política de remoção de categorias com produtos vinculados.

### Cart

- Validar variantes antes de persistir item.
- Validar estoque disponível já na adição/atualização, se desejado.

### Orders

- Implementar baixa de estoque no fechamento.
- Persistir preço final por item de forma imutável.
- Definir máquina de estados do pedido.
- Definir regras de cancelamento.
  - Observação: esses quatro pontos são interdependentes. O ideal é tratar o fechamento do pedido como um fluxo transacional único, com validação de estoque, cálculo final, criação dos itens e definição do estado inicial.

### Reviews

- Permitir avaliação apenas para compradores elegíveis.
- Definir limite de avaliações por produto/pedido/usuário.

### Promotions

- Modelar vigência, escopo e prioridade de promoções.
- Definir se promoções podem ser combinadas.
  - Observação: se esse módulo crescer, vale separar promoção de catálogo, cupom e desconto automático. Misturar tudo na mesma regra tende a complicar cálculo e manutenção.

### Payments And Shipping

- Definir cálculo de frete.
- Definir confirmação de pagamento.
- Definir falha, cancelamento e estorno.
  - Observação: frete e pagamento normalmente viram subdomínios próprios. Mesmo que o projeto continue simples, vale separar as regras para não acoplar tudo diretamente ao pedido.
