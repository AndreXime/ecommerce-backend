# Ecommerce Backend

API REST completa para uma aplicação de ecommerce, desenvolvida com **Bun** e **Hono**. Cobre todo o ciclo de compra: catálogo de produtos, carrinho, wishlist, pedidos e perfil do usuário — com autenticação segura, documentação OpenAPI e infraestrutura pronta para produção.

---

## Funcionalidades

### Autenticação e Segurança
- **Dual Token (JWT):** Access Tokens de curta duração + Refresh Tokens armazenados no PostgreSQL, ambos trafegados via cookies `HttpOnly` e `Secure`.
- **Blocklist no Redis:** ao fazer logout, o JTI do Access Token é revogado no Redis até expirar naturalmente, eliminando a janela de uso indevido pós-logout.
- **RBAC:** controle de acesso por cargo (`ADMIN`, `CUSTOMER`, `SUPPORT`).
- **Proteção CSRF** integrada.

### Ecommerce
- **Produtos:** listagem paginada com filtros (categoria, preço, estoque, busca), detalhes completos com opções selecionáveis (cor, tamanho etc.) e avaliações. Rating recalculado automaticamente a cada nova review.
- **Categorias:** listagem pública, criação restrita a ADMIN.
- **Carrinho:** persistido no banco por usuário. Adiciona, acumula, atualiza variante e remove itens.
- **Wishlist:** toggle — adiciona se não estiver, remove se já estiver.
- **Pedidos:** criação a partir do carrinho ativo (limpa o carrinho e incrementa `quantitySold`), listagem com escopo por cargo, atualização de status (ADMIN).
- **Perfil completo:** `GET /users/me` retorna `personalData`, `ordersHistory`, `wishlistProducts`, `paymentCards` e `addresses` — alinhado diretamente com a interface `User` do frontend.
- **Endereços:** adicionar, atualizar e remover; garantia de unicidade do endereço padrão.
- **Cartões de pagamento:** adicionar e remover.

### Infraestrutura
- **Rate Limiting:** global (100 req/15min) e específico para rotas de auth (10 req/15min), via Redis.
- **S3:** upload e download com URLs pré-assinadas (simulado com LocalStack em dev).
- **Filas e Email:** processamento assíncrono com BullMQ + Nodemailer.
- **Documentação:** OpenAPI 3.0 gerada automaticamente com Scalar UI.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| Framework | [Hono](https://hono.dev) |
| Banco de dados | PostgreSQL + Prisma ORM |
| Cache / Filas | Redis (ioredis + BullMQ) |
| Storage | AWS S3 SDK |
| Validação | Zod + Hono Zod OpenAPI |
| Documentação | Scalar |
| Qualidade | Biome (lint/format) + Husky |

---

## Como rodar

### 1. Variáveis de ambiente

```bash
cp .env.example .env
```

### 2. Subir serviços (PostgreSQL, Redis, LocalStack, Mailpit)

```bash
docker compose up -d
```

### 3. Instalar dependências

```bash
bun install
```

### 4. Migração e seed

```bash
bunx prisma migrate dev
bunx prisma db seed
```

O seed cria um usuário `ADMIN`, dois `CUSTOMER`s, categorias e produtos de exemplo.

### 5. Iniciar em desenvolvimento

```bash
bun dev
```

API disponível em `http://localhost:8080` · Documentação em `http://localhost:8080/docs`

---

## Rotas

### Auth — `/auth`

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` | Cadastro de usuário |
| POST | `/auth/login` | Login; retorna access + refresh token |
| POST | `/auth/refresh` | Renova o access token via refresh token |
| POST | `/auth/logout` | Revoga a sessão |

### Usuário — `/users`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/users` | ADMIN | Lista usuários com paginação |
| GET | `/users/me` | Auth | Perfil completo do usuário autenticado |
| PATCH | `/users/me` | Auth | Atualiza dados pessoais / senha |
| POST | `/users/me/addresses` | Auth | Adiciona endereço |
| PATCH | `/users/me/addresses/:addressId` | Auth | Atualiza endereço |
| DELETE | `/users/me/addresses/:addressId` | Auth | Remove endereço |
| POST | `/users/me/cards` | Auth | Adiciona cartão de pagamento |
| DELETE | `/users/me/cards/:cardId` | Auth | Remove cartão |

### Produtos — `/products`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/products` | Público | Listagem com filtros e paginação |
| GET | `/products/:id` | Público | Detalhes + opções + reviews |
| POST | `/products` | ADMIN | Cria produto |
| PATCH | `/products/:id` | ADMIN | Atualiza produto |
| DELETE | `/products/:id` | ADMIN | Remove produto |
| POST | `/products/:id/reviews` | Auth | Adiciona avaliação |

**Query params de `/products`:** `page`, `limit`, `sortBy`, `sortOrder`, `search`, `category`, `minPrice`, `maxPrice`, `inStock`.

### Categorias — `/categories`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/categories` | Público | Lista todas as categorias |
| POST | `/categories` | ADMIN | Cria categoria |

### Carrinho — `/cart`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/cart` | Auth | Retorna o carrinho (criado automaticamente) |
| POST | `/cart/items` | Auth | Adiciona item (acumula se já existir) |
| PATCH | `/cart/items/:productId` | Auth | Atualiza quantidade / variante |
| DELETE | `/cart/items/:productId` | Auth | Remove item |

### Wishlist — `/wishlist`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/wishlist/:productId` | Auth | Toggle: adiciona ou remove o produto |

### Pedidos — `/orders`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/orders` | Auth | Lista pedidos (usuário vê os seus; ADMIN vê todos) |
| GET | `/orders/:id` | Auth | Detalhes do pedido |
| POST | `/orders` | Auth | Cria pedido a partir do carrinho |
| PATCH | `/orders/:id/status` | ADMIN | Atualiza status (`delivered`, `intransit`, `cancelled`) |

---

## Estrutura do Projeto

```
src/
├── @types/           # Tipos globais (AppBindings, JWT)
├── database/
│   ├── client/       # Cliente Prisma gerado
│   ├── database.ts   # Singleton com retry e pool
│   └── seed/         # Seed de desenvolvimento
├── lib/              # Clientes externos (S3, Redis, BullMQ, env)
├── middlewares/      # Auth, CORS, rate limiter, logger, erros
└── modules/
    ├── auth/         # login, register, refresh, logout
    ├── cart/         # get, addItem, updateItem, removeItem
    ├── categories/   # list, create
    ├── orders/       # list, get, create, updateStatus
    ├── products/     # list, get, create, update, remove, addReview
    ├── user/         # me, readUser, update, addresses, cards
    ├── wishlist/     # toggle
    └── shared/       # schemas Zod, mappers, paginação

prisma/
├── models/           # Um arquivo .prisma por domínio
└── migrations/
```

Cada ação dentro de um módulo segue a estrutura de 5 arquivos: `schema`, `docs`, `controller`, `service`, `test`. Veja [PATTERNS.md](./PATTERNS.md) para detalhes.

---

## Guias

- **[PATTERNS.md](./PATTERNS.md)** — Estrutura de módulos, nomenclatura e reutilização de schemas
- **[MIDDLEWARES.md](./MIDDLEWARES.md)** — Pipeline de middlewares e ordem de execução

## Testes

```bash
bun test
```
