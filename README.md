# Agent Ready Starter

Wizard per creare applicazioni Next.js generiche, organizzate e pronte per agenti AI. Versione 0.3.0. Non impone un settore, un database o un servizio cloud.

## Crea un nuovo progetto su Windows

Non devi clonare questa repository e non servono Node, npm o Git gia installati. Apri **PowerShell** nella cartella da cui vuoi iniziare e incolla:

```powershell
$installer = Join-Path $env:TEMP 'install-agent-ready.ps1'
Invoke-WebRequest 'https://github.com/AlessandroRotili/agent-ready-starter/releases/latest/download/install-agent-ready.ps1' -OutFile $installer
& $installer
```

Se Windows blocca l'esecuzione dello script per la execution policy, usa questo ultimo comando al posto di `& $installer`:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File $installer
```

Da **Prompt dei comandi (CMD)** puoi avviare lo stesso installer con un solo comando:

```bat
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$p=Join-Path $env:TEMP 'install-agent-ready.ps1'; Invoke-WebRequest 'https://github.com/AlessandroRotili/agent-ready-starter/releases/latest/download/install-agent-ready.ps1' -OutFile $p; & $p"
```

L'installer scarica la release pubblica piu recente, ne verifica il checksum e apre il wizard. Durante il primo avvio prepara una copia privata di Node/npm in `%LOCALAPPDATA%\AgentReadyStarter`; non modifica le installazioni di sistema.

### Cosa scegliere nel wizard

Il wizard chiede:

1. **Cartella corrente oppure un percorso scelto** (relativo o assoluto).
2. Nome del prodotto/sito.
3. **Landing / Gestionale / Sito completo**.
4. **Dati locali / Mock / Database generico / Supabase**.
5. Per Supabase: account/progetto esistente, da creare oppure configurazione successiva. Senza progetto puoi partire con mock o adattatore generico.
6. **Node locale / Docker**, quando CLI e Compose compatibile sono disponibili.
7. Installazione automatica delle dipendenze nell'ambiente scelto.

La cartella corrente e quella da cui lanci il comando, non la cartella temporanea dell'installer. Se scegli **Cartella corrente**, questa deve essere vuota. In alternativa, il wizard crea il progetto nel percorso che indichi. File preesistenti non vengono sovrascritti.

### Avvia il progetto generato

Se hai scelto **Node locale**, entra nella cartella del progetto e usa:

```powershell
.\run.ps1 dev
```

Se hai scelto **Docker**, assicurati che Docker Desktop sia avviato con i container Linux, poi usa:

```powershell
./docker-start.ps1
```

Con Node locale, apri l'indirizzo mostrato da Next.js, normalmente [http://localhost:3000](http://localhost:3000). Con Docker, il comando di avvio prova la porta 3000 e, se Docker la trova occupata, riprova 3001, 3002 e cosi via fino alla 3999. Lo fa a ogni avvio e stampa l'URL effettivo, aggiornando anche l'origine pubblica usata dall'app. Su macOS/Linux usa `bash docker-start.sh`; anche `run.ps1 dev` / `run.sh dev` selezionano il launcher Docker.

### Requisiti

- Windows con PowerShell e accesso a Internet.
- Docker Desktop e opzionale e serve solo se scegli Docker nel wizard.
- Git, Node e npm non sono richiesti per eseguire l'installer.

## Uso dai sorgenti

Questa modalita serve a chi clona la repository per sviluppare o modificare il generatore. Su Windows:

```powershell
.\bootstrap.ps1
```

Su macOS/Linux:

```sh
bash ./bootstrap.sh
```

L'installer pubblico per Windows usa una cache versionata e non esegue `git clone`. I dettagli di pubblicazione e aggiornamento delle release sono in [docs/distribution.md](docs/distribution.md).

## Automazione

Con Node gia adeguato, dalla directory in cui vuoi creare il progetto:

```powershell
node C:\percorso\agent-ready-starter\bin\create.mjs --cwd --yes --name mio-prodotto --preset landing --provider none
node C:\percorso\agent-ready-starter\bin\create.mjs .\portale --yes --preset dashboard --provider mock
node C:\percorso\agent-ready-starter\bin\create.mjs D:\Progetti\sito --yes --preset fullsite --provider supabase
```

Gli stessi argomenti si possono passare a bootstrap.ps1/bootstrap.sh. Opzioni: `--title`, `--name`, `--docker`, `--no-docker`, `--no-install`, `--no-browser`, `--dry-run`, `--versions tested`. Senza `--yes` parte il wizard. Senza percorso, in modalita automatica si usa la cartella corrente; senza scelta Docker si usa Node locale.

`--dry-run` non crea file, non installa e non interroga il registry dalla CLI Node. Il launcher bootstrap prepara comunque Node/npm prima di avviare la CLI. `--no-install` genera i manifest; `--no-browser` evita il download Chromium per Playwright.

## Cosa genera

| Preset | Contenuto |
| --- | --- |
| Landing | Pagina pubblica, layout, branding, media e basi per servizi |
| Gestionale | Landing minima + area di lavoro, contratti dati/identita e test |
| Sito completo | Landing + contenuti pubblici con lista/dettaglio + area di lavoro |

| Provider | Comportamento |
| --- | --- |
| Locali | Contenuti nel repository, nessun DB |
| Mock | Dati sintetici e workspace in memoria nel browser, solo sviluppo |
| Generico | Contratti/repository da implementare; accessi privati chiusi finche manca l'identita |
| Supabase | Adapter e migrazioni; auth/account/admin/documenti nei preset Gestionale/Sito completo |

Una landing Supabase non riceve automaticamente account/admin/documenti. I mock non sono autenticazione e non diventano un fallback di produzione. Il database generico e un punto d'integrazione esplicito, non un collegamento SQL gia funzionante.

Ogni app contiene Next.js App Router, TypeScript, Tailwind, `domain/`, `services/`, `repositories/`, `components/`, `config/`, `tests/`, `docs/`, AGENTS.md, PROJECT.md, START-HERE.md e istruzioni condivise per gli editor AI. Le regole di business restano separate dal provider.

## Toolchain e installazione

I launcher risolvono le release stabili correnti di Node/npm. Su Windows vengono scaricate in `.runtime/`, verificate con SHA-256 ufficiale e riutilizzate. Non servono modifiche al Node di sistema. Il launcher POSIX segue lo stesso schema per macOS/Linux x64/arm64; richiede curl, tar e un verificatore SHA-256. Windows offre anche `-Channel lts`.

Next/React/Tailwind e le altre dipendenze vengono risolte dal registry, fissate nel manifest e installate. Viene generato package-lock.json. Chromium viene installato per i test browser salvo `--no-browser`. Con npm 12 gli script necessari di esbuild/unrs-resolver sono esplicitamente consentiti; non viene abilitato indiscriminatamente ogni postinstall.

Compatibilita documentata: TypeScript 7 usa l'API TypeScript 6 tramite alias ufficiale per il tooling; ESLint resta sull'ultima 9 compatibile finche i plugin del config Next non supportano la 10. Il resolver non usa `--force` o `--legacy-peer-deps`. I dettagli sono in [docs/dependencies.md](docs/dependencies.md).

Su Windows, nell'app generata:

```powershell
.\run.ps1 dev
.\run.ps1 check
.\run.ps1 test:e2e
```

`run.ps1` usa il Node/npm gestito dal launcher. Dove Node e gia configurato: `npm run dev`, `npm run check`, `npm run test:e2e`. Su POSIX `bash run.sh dev` usa la toolchain locale se presente. Su un'altra macchina installare la versione in .node-version e usare npm ci.

## Docker opzionale

Se la CLI segnala "installazione rimandata", il progetto e gia stato creato: non rilanciare lo scaffold nella cartella. Avvia Docker Desktop, attendi che `docker info` risponda, poi esegui `docker compose run --rm app npm install` e infine `./docker-start.ps1`. La presenza del comando docker non implica che il motore sia pronto. La CLI ricontrolla il motore dopo le risposte al wizard.

Esempio: `node bin/create.mjs ../mio-prodotto --yes --docker`. Vale anche con `--cwd` e da bootstrap.ps1/bootstrap.sh. Servono Docker con container Linux e Compose 2.30+. Il wizard verifica CLI, Compose e motore separatamente. Se il motore e spento, genera i file e rimanda l'installazione con istruzioni esplicite; non avvia Docker Desktop automaticamente. `--docker --no-install` permette di preparare un progetto per un'altra macchina anche senza Docker installato.

Nell'app generata:

```sh
# Solo se l'installazione e stata rimandata:
docker compose run --rm app npm install
# Windows: ./docker-start.ps1
# macOS/Linux:
bash docker-start.sh
```

Le dipendenze dell'app restano nei volumi Docker; il generatore usa comunque il suo Node/npm. L'app include Dockerfile multi-stage, Compose sviluppo/produzione, test browser opzionali e docs/docker.md. Produzione usa Next standalone e utente non privilegiato; file .env, toolchain e dipendenze host sono esclusi dal build context. Configurazione pubblica al build, segreti solo a runtime. Supabase/DB restano servizi da configurare separatamente.

Il launcher decide la porta durante l'avvio effettivo, senza fissarla alla generazione e senza fermare altri servizi. `APP_PORT` nella shell indica la porta da cui iniziare la ricerca (massimo 1000 tentativi, fino a 65535). Se l'app e gia in esecuzione, mostra il suo URL. I comandi Compose diretti non fanno retry: usa il launcher di sviluppo. La produzione conserva porta e origine esplicite. I progetti gia creati non vengono aggiornati automaticamente.

Docker rende l'ambiente trasferibile, ma immagini, volumi e Docker Desktop occupano spazio/RAM: nessuna promessa di risparmio automatico. Stop dei container quando inutilizzati; nessun prune globale automatico. Su un altro computer Windows basta rilanciare l'installer pubblico; il progetto generato e indipendente e puo essere trasferito con sorgenti/lockfile o come immagine di produzione.

## Agenti e contesto

AGENTS.md e il punto d'ingresso: regole critiche sempre visibili, tabella dei documenti da caricare secondo il task. Le guide in docs/agents distinguono orchestratore, agente implementatore e subagente specialista. Un task semplice resta con un solo agente; deleghe circoscritte, proprieta dei file, nessuna ricorsione automatica e risultati sintetici. L'orchestratore integra e verifica una sola volta lo stato finale; i worker eseguono controlli mirati. I test necessari restano obbligatori.

Le istruzioni sono applicate anche alle app generate. CLAUDE.md e Copilot rinviano alla guida comune. Il modello HANDOFF.md evita di copiare intere conversazioni e documenti. Questo riduce il contesto superfluo; il consumo effettivo dipende dall'agente e dal lavoro richiesto.

## Test e accortezze incluse

- Vitest per regole di business, casi limite e errori; Testing Library per i componenti.
- Soglie di coverage sui servizi/helper significativi; Playwright desktop/mobile.
- Test PostgreSQL/RLS per i moduli Supabase, senza cloud o dati reali.
- CI con typecheck, lint, test, build e browser.
- Pipeline immagini WebP/AVIF, nomi versionati, dimensioni responsive; video opzionale sensibile a visibilita/movimento ridotto/risparmio dati.
- Cache solo per contenuti pubblicati; risposte personali private/no-store; query paginate.

Non vengono creati account cloud, applicate migrazioni remote o effettuati deploy. Leggi START-HERE.md e docs/setup.md nell'app per completare i servizi selezionati. Per lavorare con un agente, compila PROJECT.md e chiedigli di seguire AGENTS.md e il modello docs/tasks/TEMPLATE.md.

## Manutenzione

```sh
npm test
npm run check:templates
```

Il secondo comando richiede la toolchain attuale, genera quattro app temporanee e ne verifica installazione/check; lascia i risultati per diagnosi. La CI copre tutte le combinazioni supportate. Sorgenti comuni in templates/base, preset in templates/presets, adapter in templates/providers. `template/` conserva il modulo account Supabase della v0.1, importato solo tramite una lista esplicita di file; non e piu lo scaffold predefinito.

[Architettura](docs/architecture.md) - [Verifiche](docs/verification.md) - [Changelog](CHANGELOG.md).
