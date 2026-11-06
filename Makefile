# Makefile — template-frontend (Next.js Octor)
# Desenvolvimento local zero config via Vault OPS
# Docs: https://backstage.octor.com.br/secrets-vault.html
#
# Após clonar o template num app novo, APP_NAME vira o nome do repo
# (ex.: web-crm). O path no vault é apps/$(APP_NAME)/dev.
# make env materializa ~/.octor/run/$(APP_NAME)/env + symlink ./.env

APP_NAME ?= $(shell basename $(CURDIR))
VAULT_URL ?= http://10.8.0.9:8200
VAULT_PATH ?= apps/$(APP_NAME)/dev
OCTOR_BIN ?= $(HOME)/.octor/bin
OCTOR_CLI := $(OCTOR_BIN)/octor-env
OCTOR_BACKSTAGE_REPO ?= 0ctor/web-backstage
OCTOR_BACKSTAGE_REF ?= dev

.PHONY: help install-cli env env-push env-diff up down logs dev install test lint build docker agents-sync install-agents-sync

help:
	@echo "Comandos (VPN Octor requerida para vault):"
	@echo "  make env        - Materializa secrets (Vault → ~/.octor/run/… + .env)"
	@echo "  make env-push   - Envia materialização local → vault"
	@echo "  make env-diff   - Compara local vs vault"
	@echo "  make install    - npm ci"
	@echo "  make dev        - env + agents-sync + npm run dev"
	@echo "  make up         - env + agents-sync + docker compose up -d"
	@echo "  make agents-sync - AGENTS.md + skills octor-* (canônico Backstage)"
	@echo "  make down       - docker compose down"
	@echo "  make test/lint/build - qualidade"
	@echo ""
	@echo "Vault path: $(VAULT_PATH)"

install-cli:
	@mkdir -p "$(OCTOR_BIN)"
	@tmp=$$(mktemp); \
	if curl -sfL --max-time 15 "$(VAULT_URL)/cli/octor-env" -o "$$tmp" 2>/dev/null; then \
	  mv "$$tmp" "$(OCTOR_CLI)"; echo "octor-env: vault"; \
	else \
	  rm -f "$$tmp"; \
	  if [ -f "$(CURDIR)/../web-backstage/scripts/octor-env" ]; then \
	    cp "$(CURDIR)/../web-backstage/scripts/octor-env" "$(OCTOR_CLI)"; \
	  elif [ -f "$(CURDIR)/scripts/octor-env" ]; then \
	    cp "$(CURDIR)/scripts/octor-env" "$(OCTOR_CLI)"; \
	  elif command -v gh >/dev/null 2>&1; then \
	    gh api "repos/$(OCTOR_BACKSTAGE_REPO)/contents/scripts/octor-env?ref=$(OCTOR_BACKSTAGE_REF)" \
	      -H "Accept: application/vnd.github.raw" > "$(OCTOR_CLI).tmp" && \
	    mv "$(OCTOR_CLI).tmp" "$(OCTOR_CLI)"; \
	  elif [ -x "$(OCTOR_CLI)" ]; then true; \
	  else echo "octor-env: sem fonte"; exit 1; fi; \
	  echo "octor-env: $(OCTOR_CLI)"; \
	fi
	@chmod +x "$(OCTOR_CLI)"

$(OCTOR_CLI):
	@$(MAKE) install-cli

env: $(OCTOR_CLI)
	@VAULT_URL="$(VAULT_URL)" "$(OCTOR_CLI)" pull "$(VAULT_PATH)"

env-push: $(OCTOR_CLI)
	@VAULT_URL="$(VAULT_URL)" "$(OCTOR_CLI)" push "$(VAULT_PATH)"

env-diff: $(OCTOR_CLI)
	@VAULT_URL="$(VAULT_URL)" "$(OCTOR_CLI)" diff "$(VAULT_PATH)"

install:
	npm ci

# Fluxo diário do dev Next: secrets + hot reload
dev: env agents-sync
	@echo "🚀 $(APP_NAME) — npm run dev"
	npm run dev

# Alternativa com Docker (compose no app gerado a partir do example)
up: env agents-sync
	@echo "🚀 Subindo $(APP_NAME) (docker compose)..."
	@if [ -f docker-compose.yml ]; then docker compose up -d; \
	elif [ -f docker-compose.example.yml ]; then docker compose -f docker-compose.example.yml up -d; \
	else echo "❌ Sem docker-compose.yml — use: make dev"; exit 1; fi
	@echo "✅ $(APP_NAME) rodando"

down:
	@if [ -f docker-compose.yml ]; then docker compose down; \
	elif [ -f docker-compose.example.yml ]; then docker compose -f docker-compose.example.yml down; \
	else true; fi

logs:
	@docker compose logs -f

test:
	npm test

lint:
	npm run lint

build:
	npm run build

docker:
	docker build -t $(APP_NAME):local .

# --- octor-agents-sync (auto) ---
OCTOR_AGENTS_SYNC ?= $(OCTOR_BIN)/octor-agents-sync

agents-sync: install-agents-sync
	@$(OCTOR_AGENTS_SYNC) .

install-agents-sync:
	@mkdir -p "$(OCTOR_BIN)"
	@if [ -f "$(CURDIR)/../web-backstage/scripts/octor-agents-sync" ]; then \
	  cp "$(CURDIR)/../web-backstage/scripts/octor-agents-sync" "$(OCTOR_AGENTS_SYNC)"; \
	elif command -v gh >/dev/null 2>&1; then \
	  gh api "repos/$(OCTOR_BACKSTAGE_REPO)/contents/scripts/octor-agents-sync?ref=$(OCTOR_BACKSTAGE_REF)" \
	    -H "Accept: application/vnd.github.raw" > "$(OCTOR_AGENTS_SYNC).tmp" && \
	    mv "$(OCTOR_AGENTS_SYNC).tmp" "$(OCTOR_AGENTS_SYNC)"; \
	elif [ -x "$(OCTOR_AGENTS_SYNC)" ]; then \
	  true; \
	else \
	  echo "octor-agents-sync: pulando (sem fonte)"; exit 0; \
	fi
	@chmod +x "$(OCTOR_AGENTS_SYNC)"
