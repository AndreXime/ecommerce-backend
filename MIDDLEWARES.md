# Pipeline de Middlewares

## Fluxo de Request

### 1. Middlewares Globais (Ordem de Execução)

1. **Request Logger** (apenas em desenvolvimento)
   - Registra informações sobre cada requisição

2. **CORS Handler**
   - Gerencia permissões de Cross-Origin Resource Sharing

3. **Dependency Injection**
   - Inicializa pool de conexões com PostgreSQL
   - Injeta dependências necessárias no contexto

4. **Global Rate Limiter**
   - Verifica e incrementa contadores no Redis
   - Retorna `429 Too Many Requests` se limite excedido

### 2. Route Matcher

Após os middlewares globais, o router decide o fluxo baseado no tipo de rota:

**Rotas Públicas:**
- Request → Input Validator → Controller

**Rotas Protegidas:**
- Request → Auth Middleware → Input Validator → Controller

### 3. Auth Middleware (Rotas Protegidas)

- Valida token de autenticação
- Verifica blocklist e sessão no Redis
- Retorna `401 Unauthorized` se falhar
- Injeta dados do usuário no contexto

### 4. Input Validator

- Valida body, query, params, cookies usando schemas Zod
- Retorna `400 Bad Request` se validação falhar

### 5. Controller

- Executa lógica de negócio
- Faz queries/mutations no PostgreSQL
- Retorna resposta de sucesso ou lança exceção

### 6. Global Error Handler

Captura todos os erros e retorna resposta apropriada:
- `400` - Validação falhou
- `401` - Não autenticado
- `403` - Não autorizado (role insuficiente)
- `409` - Conflito (ex: email duplicado)
- `429` - Rate limit excedido
- `500` - Erro interno