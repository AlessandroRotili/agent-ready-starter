# Composizione dello scaffold

Il launcher prepara Node/npm; la CLI raccoglie risposte o flag, valida la destinazione, compone file, risolve versioni e installa dipendenze. Queste fasi sono separate e testabili.

- bootstrap.ps1 / bootstrap.sh: download verificato di Node e npm locale; nessuna sostituzione globale.
- lib/wizard.mjs: domande con prompt iniettabile per i test.
- lib/options.mjs: combinazioni e configurazioni ammesse.
- lib/scaffold.mjs: composizione comune/preset/provider, senza sovrascrivere file utente.
- lib/dependencies.mjs: registry, versioni esatte, installazione tramite argv senza shell.
- lib/docker.mjs: rilevamento CLI/Compose >=2.30/motore Linux con timeout; installazione in volumi tramite argv senza shell. Nessun avvio automatico del daemon.
- L'avvio Docker di sviluppo usa gli script generati docker-start.ps1 / docker-start.sh, richiamati anche da run.ps1 dev / run.sh dev. A ogni avvio tentano Compose up dalla porta 3000 (o APP_PORT), incrementandola solo in caso di conflitto di bind; massimo 1000 tentativi e limite 65535. La porta viene acquisita da Docker durante l'avvio, senza probe anticipato ne valori salvati nel generatore. DOCKER_SITE_URL allinea NEXT_PUBLIC_SITE_URL alla porta effettiva senza modificare .env.local. Un'app gia attiva viene riutilizzata. Build e altri errori non vengono mascherati; la produzione usa configurazione esplicita.
- La CLI ricontrolla il motore dopo il wizard; se l'installazione e rimandata, mostra la sequenza di ripresa completa (motore pronto, npm install nel container, avvio).
- templates/base: fondazione Next/TypeScript/Tailwind, media, servizi, test e docs.
- templates/presets: sole funzionalita associate alla scelta.
- templates/providers: infrastruttura dati opzionale.
- templates/features/docker: overlay opt-in Dockerfile/Compose/docs; output standalone solo quando selezionato. La composizione sostituisce versioni Node/Playwright validate e registra runtime in starter.json.
- scripts/package-release.mjs: allowlist del runtime distribuibile, con esclusione ricorsiva di cache, segreti e artefatti.
- scripts/install-release.template.ps1 e render-installer.mjs: installer singolo con repository, versione e checksum fissati dalla release.
- .github/workflows/release.yml: su tag coerente con package.json verifica il generatore, crea ZIP/checksum/installer e pubblica gli asset GitHub.
- template/: modulo account Supabase precedente; viene incluso tramite whitelist solo quando richiesto.

Le cartelle correnti o scelte sono risolte tramite realpath/antenati esistenti. La destinazione deve essere vuota e non sovrapporsi al generatore. Il dry run termina prima di rete e scritture. Configurazioni pubbliche Supabase fornite nel wizard finiscono solo in .env.local ignorato da Git; chiavi privilegiate sono rifiutate.

Dati pubblici: route -> content service -> repository -> locale/generico/Supabase. Cache condivisa solo dei contenuti pubblicati. Area mock: stato sintetico browser, visibile solo in development. Area generica: interfacce di identita e persistenza ancora da collegare. Area Supabase: guardie server, session client, RLS e API esplicite.

Ogni applicazione riceve scelte/versione in starter.json, manifest esatto e lockfile dopo installazione. Il codice generato non importa il generatore. I file .toolchain locali servono solo ai launcher, sono ignorati da Git e non sono necessari su altri computer con Node/npm adeguati.

Se installazione/rete falliscono, i file rimangono per diagnosi e ripresa manuale. Nessuna cancellazione ricorsiva automatica di cartelle dell'utente. Nuove release dipendenze possono introdurre incompatibilita: il check deve segnalarle, non aggirarle.

Docker assente/spento non impedisce la generazione esplicita: l'installazione e rimandata e registrata come non eseguita. Il wizard offre Docker solo con CLI e Compose disponibili; --docker consente preparazione su altra macchina. Le dipendenze app sono nel volume Compose; il lockfile resta nei sorgenti. Il browser usa un target opzionale con Chromium/librerie; la produzione copia solo l'output standalone, gli asset pubblici e i chunk statici. Non si copiano .env o toolchain nell'immagine. I provider rimangono esterni.

Le guide agenti sono progressive: AGENTS.md contiene confini e mappa, docs/agents descrive responsabilita e formato handoff. Non sono un runtime multiagente: orchestrazione concreta dipende dagli strumenti disponibili. Evitare letture e test integrati duplicati senza nascondere vincoli di sicurezza o ridurre le verifiche.

La distribuzione remota non usa git clone: un installer versionato scarica il solo archivio della Release e lo valida prima di estrarlo in una cache utente. Il codice generato continua a essere scritto nella cartella scelta dal chiamante. Il repository deve essere pubblico per il download anonimo previsto; l'installer non raccoglie token GitHub.
