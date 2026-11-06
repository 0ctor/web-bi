# web-bi — Painel da clínica

Respostas prontas para quem cuida da clínica ou do consultório. A tela fala em
português: idade que mais aparece, bairro, como a pessoa chegou, faltas,
horário cheio, atendimento mais procurado, pacientes novos e o que entrou no
mês. Não há construtor de gráfico.

O recorte vem de relatórios prontos de consultório (Jane, Cliniko,
SimplePractice, iClinic, Feegow, Shosp). A conta fica dentro da Octor. Detalhe
em [docs/produto.md](./docs/produto.md).

| Campo | Valor |
|-------|--------|
| Repositório | [`0ctor/web-bi`](https://github.com/0ctor/web-bi) |
| AppMenu | `bi` (`NEXT_PUBLIC_APP_ID`) |
| Host pretendido | `bi.octor.com.br` — ainda sem registro no PaaS nem no web-auth |
| Auth | SSO [web-auth](https://github.com/0ctor/web-auth) |
| Dado | agregado da agenda e do financeiro; este app não guarda ficha |

Nesta versão as cartas dizem que a agenda ou o financeiro ainda não enviaram o
resumo. Não há número de exemplo.

## O que já vem do template

| Peça | Detalhe |
|------|---------|
| SSO | `NEXT_PUBLIC_AUTH_*` → portal; `/auth/callback` |
| Acesso | `GET /v1/account` + `resolveAppAccess` (`NEXT_PUBLIC_APP_ID=bi`) |
| Health | `/api/health/live` + `/api/health/ready` |
| Loki | `POST /api/errors/report` sem senha no browser |
| CI | lint · tsc · vitest · build |

## Local

```bash
cp .env.example .env
npm install
npm run dev
```

App em `http://localhost:3000`. Com VPN e Vault, `make env` e `make dev`.

Scaffold sem portal: `NEXT_PUBLIC_CENTRAL_AUTH_ENABLED=false` no `.env`.

## Deploy

Ainda não sobe. O snippet de compose e de `apps.json` está em
`docker-compose.example.yml` e `docs/apps.json.example`. Registro no host,
DNS, Statuspage, allowlist do web-auth e catálogo ficam para o primeiro
deploy — só a partir de `main`, pelo platform-deploy-hook.
