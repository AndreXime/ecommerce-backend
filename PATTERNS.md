# Padrões do Projeto

## Estrutura de Módulos

### Os 5 Arquivos Obrigatórios por Ação

**É fortemente recomendado que cada ação tenha exatamente 5 arquivos:**

```
src/modules/{módulo}/{ação}/
  ├── {ação}.schema.ts      # Schemas Zod e tipos
  ├── {ação}.docs.ts        # Definição OpenAPI
  ├── {ação}.controller.ts  # Handler da rota
  ├── {ação}.service.ts     # Lógica de negócio
  └── {ação}.test.ts        # Testes unitários
```

**Exemplo completo:**
```
src/modules/auth/login/
  ├── login.schema.ts
  ├── login.docs.ts
  ├── login.controller.ts
  ├── login.service.ts
  └── login.test.ts
```

Esta estrutura garante:
- **Separação clara de responsabilidades**
- **Testabilidade** (testes isolados)
- **Manutenibilidade** (fácil localizar e modificar código)
- **Consistência** em todo o projeto

### Separação de Schemas

#### `.schema.ts`
Contém todas as definições de schemas Zod. Centraliza a validação e tipos.

```typescript
export const LoginRequestSchema = UserSchema.pick({
  email: true,
  password: true,
});

export const LoginResponseSchema = z.object({
  message: z.string().openapi({ example: "Login com sucesso" }),
});
```

#### `.docs.ts`
Apenas importa e referencia schemas. **Não deve conter `z.object` inline.**

```typescript
import { LoginRequestSchema, LoginResponseSchema } from "./login.schema";

export const LoginRoute = createRoute({
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: LoginResponseSchema,
        },
      },
    },
  },
});
```

## Nomenclatura de Schemas

Padrão: `{Ação}{Request|Response}Schema` para schemas e `{Ação}{Request|Response}` para tipos.

### Schemas (Definições Zod)
Sempre incluem `Schema` no final.

**Request Schemas:**
- Usados em `request` (body, query, params, cookies)
- Formato: `{Ação}Request{Tipo}Schema`

```typescript
export const LoginRequestSchema = ...           // body
export const RegisterRequestSchema = ...        // body
export const RefreshRequestSchema = ...         // cookies
export const ReadUserRequestQuerySchema = ...   // query
```

**Response Schemas:**
- Usados em `responses`
- Formato: `{Ação}ResponseSchema`

```typescript
export const LoginResponseSchema = ...
export const RegisterResponseSchema = ...
export const MeResponseSchema = ...
export const ReadUserResponseSchema = ...
```

### Tipos (z.infer)
**NÃO** incluem `Schema` no nome.

```typescript
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type ReadUserRequestQuery = z.infer<typeof ReadUserRequestQuerySchema>;
export type ReadUserResponse = z.infer<typeof ReadUserResponseSchema>;
```

### Exemplo Completo

```typescript
// login.schema.ts
import { z } from "@hono/zod-openapi";
import { UserSchema } from "@/modules/shared/schemas/user";

// Schema de Request
export const LoginRequestSchema = UserSchema.pick({
  email: true,
  password: true,
});

// Schema de Response
export const LoginResponseSchema = z.object({
  message: z.string().openapi({ example: "Login com sucesso" }),
});

// Tipo inferido (usado no service)
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
```

```typescript
// login.service.ts
import type { LoginRequest } from "./login.schema";

async function authenticate(data: LoginRequest) {
  // lógica de autenticação
}
```

## Reutilização de Schemas

Prefira usar schemas do `shared/schemas` com transformações:

```typescript
import { UserSchema } from "@/modules/shared/schemas/user";

// Omitir campos
export const RegisterRequestSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Selecionar campos
export const LoginRequestSchema = UserSchema.pick({
  email: true,
  password: true,
});

// Omitir senha em responses
export const MeResponseSchema = UserSchema.omit({ password: true });
```
