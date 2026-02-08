# Bun Hono Ecommerce Template

Uma **API Template** de alto desempenho, desenvolvida com **Bun** e **Hono**. Este projeto serve como um "starter kit" completo para aplicações modernas, trazendo uma arquitetura sólida e pré-configurada com as melhores práticas de mercado.

O objetivo é fornecer uma fundação segura e escalável, integrando nativamente autenticação avançada, gestão de ficheiros, filas de processamento e base de dados, poupando semanas de configuração inicial.

---

## Funcionalidades Principais

### Autenticação e Segurança
O sistema utiliza uma estratégia híbrida e segura para gestão de sessões:
* **Dual Token System (JWT):** Utiliza *Access Tokens* (curta duração) e *Refresh Tokens* (longa duração) geridos via Cookies `HttpOnly` e `Secure`.
* **Gestão de Estado de Tokens:**
    * **Refresh Tokens no PostgreSQL:** Armazenados na base de dados para permitir a invalidação de sessões e verificar a legitimidade ao solicitar novos tokens de acesso.
    * **Access Tokens no Redis (Blocklist):** Implementação de uma *Blocklist* para gestão de **Logout**. Quando um utilizador termina a sessão, o JTI (ID do token) é revogado no Redis até à sua expiração natural, eliminando a brecha de segurança onde um cookie ainda poderia ser válido após o logout.
* **RBAC (Role-Based Access Control):** Middleware de controlo de acesso baseado em cargos (`ADMIN`, `CUSTOMER`, `SUPPORT`).
* **Proteção CSRF:** Integrada nativamente.

### Middlewares e Validação
O fluxo de requisição passa por uma cadeia estrita de verificações:
1.  **Logger:** Registo detalhado de requisições e erros.
2.  **Global Rate Limiter:** Proteção contra abuso geral (100 req/15min).
3.  **Strict Auth Rate Limiter:** Proteção específica para rotas de autenticação (Login/Registo) para prevenir *brute-force* (10 req/15min).
4.  **Validação Zod:** Todos os inputs (Body, Query, Params) são validados estritamente com schemas Zod antes de atingirem os controladores.

### Infraestrutura e Serviços Integrados
* **Base de Dados:** PostgreSQL gerido via **Prisma ORM**.
* **Cache & Performance:** Redis (via `ioredis`) utilizado para *Rate Limiting* e *Blocklist* de tokens.
* **Armazenamento de Ficheiros (S3):** Integração com AWS S3 (simulado com **LocalStack** em desenvolvimento) para upload e download de ficheiros com URLs pré-assinados.
* **Sistema de Filas e Email:** Processamento assíncrono com **BullMQ** (Redis) e envio de emails transacionais via **Nodemailer**.

### 📚 Documentação
* **OpenAPI 3.0:** Especificação completa da API gerada automaticamente.
* **Scalar UI:** Interface interativa para testar e visualizar a documentação.

---

## 🛠️ Stack Tecnológica

* **Runtime:** [Bun](https://bun.sh)
* **Framework:** [Hono](https://hono.dev)
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Cache/Queue:** Redis
* **Storage:** AWS S3 SDK
* **Validation:** Zod & Hono Zod Validator
* **Docs:** Scalar & Zod OpenAPI
* **Tooling:** Biome (Linter/Formatter), Husky (Git Hooks)

---

## 📂 Estrutura do Projeto

```bash
src/
├── @types/          # Definições de tipos globais
├── database/        # Cliente Prisma e Seeds
├── lib/             # Configurações de clientes (S3, Redis, Env, Queue)
├── middlewares/     # Camadas de processamento (Auth, Logs, Rate Limit, Zod)
├── modules/         # Lógica de negócio modular
│   ├── auth/        # Login, Registo, Refresh, Logout, Blocklist
│   ├── user/        # Gestão de utilizadores e perfis
│   └── shared/      # Utilitários partilhados (Schemas, Paginação)
└── index.ts         # Ponto de entrada da aplicação
```

## Testes

O projeto utiliza o test runner nativo do Bun.
```bash
bun test
```