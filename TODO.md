# TODO

## Prioridade Alta

## Prioridade Média

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

- Definir política de remoção e arquivamento de produtos.
- Definir política de remoção de categorias com produtos vinculados.

### Cart

- Validar estoque disponível já na adição/atualização, se desejado.

### Orders

### Reviews

### Promotions

- Modelar vigência, escopo e prioridade de promoções.
- Definir se promoções podem ser combinadas.
  - Observação: se esse módulo crescer, vale separar promoção de catálogo, cupom e desconto automático. Misturar tudo na mesma regra tende a complicar cálculo e manutenção.

### Payments And Shipping

- Definir cálculo de frete.
- Definir confirmação de pagamento.
- Definir falha, cancelamento e estorno.
  - Observação: frete e pagamento normalmente viram subdomínios próprios. Mesmo que o projeto continue simples, vale separar as regras para não acoplar tudo diretamente ao pedido.
