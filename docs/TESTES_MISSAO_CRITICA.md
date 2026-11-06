# Testes missão-crítica — padrão Octor (todos os repositórios `0ctor/*`)

Vale para **qualquer** repositório da org GitHub **`0ctor/*`** — apps `web-*` /
`platform-*`, templates, help, bridges, extensões, workers, hooks, mobile,
backstage, infra de app, etc. Não há exceção por “app secundária”.

Toda app Octor é **software de missão crítica** (clínica, financeiro, identidade,
LGPD). Produção é **fail-closed**: erro em produção é incidente. Tratar como
aviação / F1 — não “só um minutinho offline”.


Fonte canônica nos templates:

- Frontend: [`0ctor/template-frontend`](https://github.com/0ctor/template-frontend) → `docs/TESTES_MISSAO_CRITICA.md`
- API Rust: [`0ctor/template-api-rust`](https://github.com/0ctor/template-api-rust) → `docs/TESTES_MISSAO_CRITICA.md`

Apps existentes devem **convergir** para este padrão (não inventar pirâmide paralela).

---

## Pirâmide obrigatória

```text
        /\
       /E2E\          Playwright autenticado (fluxo crítico do produto)
      /------\
     / Integ. \       API + MySQL efêmero / health ready / contratos HTTP
    /----------\
   / Regressão  \     *.regression.test.* + canários de bug P0 + smoke de bundle
  /--------------\
 / Unitário       \   Vitest / cargo test / PHPUnit (puro, sem I/O externo)
/------------------\
 Estático           lint · typecheck · fmt/clippy · gates estáticos (TDZ, soft-delete)
```

Regra de ouro: **se o teste não teria pegado o incidente de produção, o gate está incompleto.**  
Todo P0 fecha com: correção + regressão automatizada + gate no CI de `dev` **e** `main`.

---

## Frontend (obrigatório em toda app FE)

| Camada | O que automatizar | Como (padrão) | Bloqueia CI? |
|--------|-------------------|---------------|--------------|
| Estático | ESLint (erros), TypeScript, gate TDZ em deps de hooks (React) | `lint`, `tsc --noEmit` / `typecheck:critical`, `check:tdz` | ✅ |
| Unitário | auth/SSO, session guard, parsers, utils, access/plano | Vitest `*.test.ts(x)` | ✅ |
| Regressão | Canário de cada bug P0 (ordem de declaração, soft-delete UI, delog falso) | `*.regression.test.ts(x)` | ✅ |
| Contratos | Rotas pós-ação (`/…/view/:uuid`), shape de payload FE↔API | `*.contract.test.ts` | ✅ |
| Smoke bundle | App monta sem `before initialization` / tela branca | Playwright no **build de produção** | ✅ |
| E2E crítico | 1 fluxo feliz autenticado do domínio (ex.: iniciar atendimento) | Playwright + SSO homolog | 🎯 alvo |

### Scripts mínimos (`package.json`)

```json
{
  "scripts": {
    "lint": "eslint …",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:regression": "vitest run regression.test",
    "test:contracts": "vitest run contract.test",
    "test:smoke:build": "npm run build && playwright test",
    "test:ci": "npm run lint && npm run typecheck && npm test && npm run test:regression && npm run test:contracts"
  }
}
```

(Vite: incluir `check:tdz` no `pretest` / `test:ci` quando houver componentes grandes com hooks.)

### Obrigatório específico Octor (FE)

1. **`authSessionGuard`** — testes: 401 genérico **não** limpa sessão; identity 401 limpa.
2. **SSO build-time** — smoke/bundle contém `auth.octor.com.br` (Vite/`VITE_*` ou Next/`NEXT_PUBLIC_*`).
3. **Acesso plano** — `resolveAppAccess` / equivalente: rejeita `profile=admin`, exige tenant + entitlement.
4. **Health** — `/health/live` + `/health/ready` (ou `/api/health/…`) com JSON canônico.
5. **Loki** — report FE via API (`/errors/report`); nunca senha Loki no bundle.
6. **Marca** — primary `#0CAF60` (template Next): teste de preset/theme.

---

## Backend / API (obrigatório em toda app API)

| Camada | O que automatizar | Como (padrão) | Bloqueia CI? |
|-------|-------------------|---------------|--------------|
| Estático | `cargo fmt --check`, `clippy -D warnings` (Rust) / lint PHP | CI | ✅ (templates); apps legadas: promover |
| Unitário | health contract, soft-delete helpers, auth introspect mock, crypto, datetime | `cargo test` / PHPUnit | ✅ |
| Contratos | Body de create/update, envelope `{status,data,message}`, campos obrigatórios | unitários no handler | ✅ |
| Integração | create → get → soft-delete → list não vaza deleted | Testcontainers / MySQL efêmero | 🎯 alvo |
| Ready | `/health/ready` 200/503 sem vazar secrets | teste HTTP ou contrato JSON | ✅ |

### Rust (template-api-rust)

```bash
cargo fmt --all -- --check
cargo clippy --all-targets -- -D warnings
cargo test --all-targets
```

### Obrigatório específico Octor (API)

1. **Health** — live sem deps; ready com deps; body mínimo `status` + `service`.
2. **Soft delete** — delete de usuário = `UPDATE deleted_at/deleted_by`; listagens `WHERE deleted_at IS NULL`.
3. **Auth** — introspect web-auth; rejeitar JWT admin em app de cliente.
4. **Loki** — push de erros + `POST /v1|/v2/errors/report` para o FE.
5. **Schema** — não inventar colunas; migrations versionadas.
6. **User DB** — nunca `root` na connection string da app.

---

## Onde o CI deve rodar (fail-closed)

| Momento | Obrigatório |
|---------|-------------|
| PR → `dev` | Suite completa FE + API |
| PR → `main` (hotfix/`dev` promote) | Suite completa |
| Push `dev` | Suite completa (e/ou deploy só após verde) |
| Push `main` | Suite completa **antes** de build/push GHCR (`needs: quality`) |
| Pós-deploy | Health ready + Statuspage + Loki + smoke do fluxo alterado |

Sem bypass de admin em rotina. Branch protection deve exigir o check de quality.

---

## Naming de arquivos (convenção)

| Sufixo | Uso |
|--------|-----|
| `*.test.ts(x)` / `*_test.rs` | Unitário |
| `*.regression.test.ts(x)` | Canário de bug que já ocorreu (ou quase) |
| `*.contract.test.ts(x)` | Contrato FE↔API / rota / envelope |
| `*.integration.test.ts(x)` | Com deps reais (DB, rede controlada) |
| `e2e/*.spec.ts` | Playwright |

---

## Checklist “app nova / template”

- [ ] Scripts `test:ci` + `test:smoke:build` (FE) ou `cargo test`+fmt+clippy (API)
- [ ] Workflow CI em PR `dev`/`main` + push `dev`
- [ ] Push `main` **não** publica imagem sem quality verde
- [ ] Pelo menos 1 regressão + 1 contrato no domínio principal
- [ ] Testes de session guard / soft-delete / health
- [ ] Docs deste arquivo versionadas no repo
- [ ] Bug P0 → regressão nova no mesmo PR do fix

---

## Próximo endurecimento (todas as apps)

1. Integração API com MySQL efêmero  
2. E2E SSO do fluxo crítico em homolog  
3. Coverage mínimo em crypto/auth/pagamento/clínico  
4. Chaos: 502 auth sem delog; retry  
5. Property/fuzz em datetime e cifrado  
6. Mutation testing nos gates TDZ/contratos  

Referência de implementação avançada: `web-medical-record` → `docs/CI_MISSION_CRITICAL.md`.
