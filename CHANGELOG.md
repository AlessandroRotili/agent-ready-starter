# Changelog

## 0.3.1 - 2026-09-25

Gli script generati docker-start.ps1 / docker-start.sh (anche tramite run.ps1 dev / run.sh dev) cercano una porta disponibile a ogni avvio Docker di sviluppo, riprovando soltanto gli errori di bind. Partono da 3000 o APP_PORT e provano fino a 1000 porte; mostrano l'URL effettivo e allineano l'origine pubblica runtime. Nessuna porta viene fissata durante la generazione. L'app gia attiva viene riutilizzata e gli altri errori restano visibili. Produzione con porta/origine esplicite.

## Installer standalone GitHub - 2026-09-25

Packaging minimale tramite allowlist, installer PowerShell con cache versionata e verifica SHA-256, più workflow GitHub che pubblica automaticamente gli asset al push di un tag coerente con package.json. Nessun clone, esempio, runtime locale o file privato viene distribuito. Guida operativa in docs/distribution.md.

## Correzione avvio Docker - 2026-09-25

Il riepilogo CLI con installazione rimandata mostra ora prima l'attesa del motore e npm install nel container, poi compose up. Il motore viene ricontrollato al termine del wizard per evitare di riusare uno stato rilevato prima delle risposte.

## 0.3.0 - 2026-09-25

Wizard con ambiente Node locale o Docker, rilevamento CLI/Compose/motore, flag --docker/--no-docker e installazione rimandata quando Docker non e pronto. Overlay Docker opzionale con sviluppo su volumi, browser test separati e produzione Next standalone non-root. Nessuna installazione delle dipendenze dell'app sull'host in modalita Docker; nessun provisioning DB implicito.

AGENTS.md con caricamento del contesto per argomento e guide orchestratore/agente/subagente, proprieta dei file, handoff sintetici e verifica integrata centralizzata. Le app esistenti non vengono riscritte automaticamente. Test generatore Docker e workflow CI dedicato; evidenze in docs/verification.md.

Verificatore corretto per espandere i percorsi temporanei Windows 8.3 prima dei test Vite. Verifica conclusa: 21 test generatore, quattro app locali con check completo, Docker sviluppo/produzione e due test browser nel container.

## 0.2.0 - 2026-09-25

Scaffold ricomposto in fondazione comune, preset Landing/Gestionale/Sito completo e provider locale/mock/generico/Supabase. Wizard con scelta cartella corrente o percorso, stato account/progetto Supabase e fallback senza cloud. Flag non interattivi equivalenti, incluso --cwd.

Launcher Windows/macOS/Linux con Node/npm gestiti localmente; dipendenze installate automaticamente, versioni esatte e lockfile; Chromium per i test salvo esclusione esplicita. Next/React/Tailwind correnti, TypeScript 7 con API compatibile e vincolo ESLint 9 documentato.

Struttura domain/services/repositories, media WebP/AVIF versionati, cache per contenuti pubblicati, mock disabilitato in produzione, porte generiche chiuse finche manca l'integrazione. Vitest/Testing Library/coverage, Playwright desktop/mobile, test SQL/RLS opzionali, CI e istruzioni agenti aggiornate.

La v0.1 non e piu lo scaffold predefinito. Le app gia generate restano indipendenti; non vengono sovrascritte automaticamente. Verifiche v0.2 in docs/verification.md.

## 0.1.0 - 2026-09-25

Prima base locale: CLI di scaffold, template Next.js/Supabase, autenticazione, account, admin di sola lettura sui profili, documenti privati, componente video opzionale e istruzioni AI condivise.

Test automatici del generatore e dei permessi SQL; pipeline TypeScript/lint/test/build. Ogni app riceve un manifest di provenienza e un lockfile indipendente.

Verifica locale completata: 5 test del generatore e 4 del template; TypeScript, lint e build passati sul template e sull'app generata `agent-ready-demo`. Homepage/login controllati nel browser desktop/mobile, inclusi redirect anonimi, gestione del provider assente e controlli API su origine/input. Dettagli e limiti in `docs/verification.md`.

I servizi remoti vanno configurati per ciascuna app. Non sono inclusi moduli eventi, newsletter, gallery pubblica o migrazioni dei dati Wild Wings. Le prove dei flussi Auth/Storage ospitati devono essere eseguite dopo la configurazione del nuovo progetto Supabase.
