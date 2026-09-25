# Verifica v0.3.0

## Porta dinamica a ogni avvio Docker - 25 settembre 2026

La scelta della porta e ora nel launcher di sviluppo, non nella generazione. Windows con Node 26.10.0/npm 12.1.0 gestiti dal bootstrap: npm test completato, 25 test passati. I test del launcher esercitano lo stesso script con disponibilita diversa fra due avvii, conflitti Linux/Windows, porta iniziale preferita, esaurimento intervallo, input invalido, app gia attiva e fallimenti non legati alle porte (nessun retry). Verificati percorsi con spazi, chiamata da altra directory e ripristino dell'ambiente PowerShell. La stessa suite del launcher passa su Bash nel container Linux.

Prova reale Windows/Docker Desktop Linux su una nuova app temporanea (starter-dynamic-start-UUxD3x/port-check), tramite run.ps1 dev: con listener host sulle porte 3000 e 3001, avvio sulla 3002. Fermata solo l'app di prova e occupata anche la 3002, lo stesso progetto riparte sulla 3003 senza rigenerare o modificare file. HTTP 200 e NEXT_PUBLIC_SITE_URL corretto in entrambi i casi; .env.local invariato. Un terzo avvio riutilizza il container gia attivo sulla 3003. Build del target development e validazione dei Compose sviluppo/produzione riuscite. Rimossi container/rete di prova e chiusi i listener; immagini/volumi conservati come cache.

`npm run check:templates` completato con exit code 0 in Linux con Node 26.10.0/npm 12.1.0: installazione, typecheck, lint, coverage e build passati per landing locale (11 test), gestionale mock (13), sito generico (13) e sito Supabase (13 piu 5 test locali SQL/RLS/validazione). Artefatti nel volume `starter-dynamic-template-check`, directory `/work/agent-ready-verify-EZR8rZ`. Documentazione e diff verificati.

Il launcher opera sull'avvio Docker effettivo, senza probe locale anticipato; la produzione mantiene porta e origine configurate esplicitamente. Nessun progetto esistente viene aggiornato e nessuna release viene pubblicata. Bash verificato in Linux con CLI simulata; avvio Docker reale verificato da PowerShell su Windows. macOS nativo, ARM64 e daemon remoti non verificati. Nessun servizio cloud collegato.

## Distribuzione standalone - 25 settembre 2026

Packaging e installer GitHub predisposti e verificati localmente. `npm test`: 24 test passati, inclusi allowlist dell'archivio, esclusione ricorsiva di esempi/cache/test/env/artefatti legacy, corrispondenza versione e rendering dell'installer senza `Invoke-Expression`. Parser PowerShell: nessun errore.

Prova end-to-end da cartella temporanea esterna: creato ZIP v0.3.0 di 148278 byte con 161 file runtime; installer generato con repository/versione/SHA-256 fissati; archivio validato ed estratto in cache vuota; Node 26.10.0/npm 12.1.0 installati nella cache senza modifica di sistema; dry run CLI riuscito. Seconda esecuzione senza download/toolchain reinstall ha generato una landing reale da 63 file: AGENTS presente, nessun esempio o `.runtime` nel progetto. Un installer con checksum intenzionalmente errato ha rifiutato l'archivio senza creare una versione in cache.

Il workflow GitHub verifica tag/package e test, costruisce ZIP/checksum/installer e crea la Release tramite `gh`. La pubblicazione remota non è stata eseguita: la repository locale è inizializzata su `main` ma non ha commit/remote e GitHub CLI non è autenticata. Scansione pre-pubblicazione: nessuna credenziale; rilevati soltanto una stringa di test `sb_secret_forbidden`, normali campi password nel codice e `template/.env.example` con valori vuoti/localhost. La prova temporanea locale (172348316 byte inclusa la toolchain) è stata spostata nel Cestino dopo la verifica.

## Docker e recovery

### Ripresa installazione Docker - 25 settembre 2026

Riprodotto il problema dell'utente: contesto desktop-linux selezionato, CLI disponibile ma pipe del motore assente e nessun processo Docker Desktop. Avviato Desktop, confermato motore Linux, completata l'installazione nella cartella esistente Desktop/agent-test senza rigenerarla. Aggiornati lockfile e stato installed/browserInstalled tramite l'installer Docker.

Il progetto agent-test passa typecheck, lint, 11 test con coverage, build e due test browser desktop/mobile. Avviato il servizio app: HTTP 200 su http://localhost:3000 con titolo My Product. Docker Desktop e il servizio dell'utente sono lasciati accesi.

Corretto il riepilogo CLI dopo installazione rimandata (prima motore pronto e npm install nel container, poi avvio); lo stato del motore viene ricontrollato dopo il wizard. Aggiornate le istruzioni di recupero. Verifiche: 21 test generatore passati e npm run check:templates completato con exit code 0 sui quattro preset nel container Linux con Node 26.10.0/npm 12.1.0. Artefatti nel volume starter-recovery-check-0925, directory /tmp/agent-ready-verify-UnxvcA. Nessun servizio cloud collegato.

## Verifica iniziale

Data: 25 settembre 2026. Windows con Node 26.10.0/npm 12.1.0; Docker Desktop Linux, Compose 5.0.2. Nessun servizio cloud collegato.

- Generatore: 21 test passati. Incluse composizione dei preset, wizard locale/Docker, CLI assente, Compose obsoleto, motore spento/Windows/Linux e CLI --cwd con installazione Docker rimandata. Installazione simulata registra successo soltanto dopo il completamento.
- Compose sviluppo/produzione: configurazioni validate con il vero comando docker compose config.
- App generata in ../agent-ready-examples/docker-landing-v03: installazione effettiva nei volumi Docker, lockfile nei sorgenti; typecheck, lint, 11 unit/component test con coverage e build standalone passati nel container.
- Immagine produzione costruita con npm ci; container healthy, homepage e CSS HTTP 200 su porta di prova 3317. UID 1000 (node), nessun bind mount, .env.local e .toolchain.json assenti nell'immagine. Dev server HTTP 200 su porta di prova 3318.
- Correzioni emerse nelle prove: il target development non forza NODE_ENV, per consentire al comando Next di scegliere l'ambiente corretto; il verificatore espande i percorsi temporanei Windows 8.3 prima di eseguire Vite.
- Guide agenti, handoff, README, setup e workflow CI aggiornati; file dei ruoli e link della guida principale verificati. Le guide sono istruzioni progressive, non un runtime che avvia automaticamente agenti.
- Browser Docker: due test Playwright desktop/mobile passati usando il target browser separato. Container di sviluppo, produzione e test fermati/rimossi dopo la prova; volumi e immagini restano come cache riutilizzabile. Docker Desktop riportato allo stato iniziale spento.
- npm run check:templates completato con exit code 0: quattro app appena generate, installazione e check completo (typecheck, lint, coverage, build) passati. Landing locale: 11 test; gestionale mock: 13; sito generico: 13; sito Supabase: 13 piu 5 test SQL/RLS/validazione. Risultati mantenuti in %LOCALAPPDATA%/Temp/agent-ready-verify-SZHRP1 per diagnosi.

Limiti: provider Supabase reale non collegato; la CI e configurata ma non eseguita su GitHub in questa sessione. Container Linux amd64 verificati su Docker Desktop; macOS/Linux nativi e ARM64 non provati in questa sessione. Le app gia esistenti non sono state aggiornate automaticamente.

# Verifica v0.2.0 (storico)

Data: 25 settembre 2026. Windows, Node 26.10.0/npm 12.1.0 gestiti dal bootstrap. Nessun servizio cloud collegato.

## Risultati

| Controllo | Esito |
| --- | --- |
| Generatore/wizard | 16 test passati, incluse 11 combinazioni preset/provider |
| Destinazione corrente | CLI --cwd testata in directory temporanea; bootstrap.ps1 richiamato realmente da una directory esterna |
| Bootstrap Windows | Download Node verificato SHA-256, npm locale installato, nessuna sostituzione di sistema |
| Launcher POSIX | Sintassi Bash verificata; installazione nativa macOS/Linux non eseguita da Windows |
| Landing locale | Typecheck, lint, unit/component test, coverage e build passati |
| Gestionale mock | Typecheck, lint, unit/component test, coverage e build passati |
| Sito completo generico | Typecheck, lint, unit/component test, coverage e build passati |
| Sito completo Supabase | Check completo piu 5 test d'integrazione SQL/RLS/validazione passati |
| Playwright | 18 test desktop/mobile passati: 2 landing, 4 mock, 6 Supabase senza credenziali, 6 generico |
| Mock in produzione | Nessuna UI mock attiva; risposta private,no-store, verifica HTTP e agent-browser |
| Media pipeline | Immagine sintetica 2000x1000 -> sei varianti WebP/AVIF 480/960/1600 verificate |
| Video | Test componenti passati per poster esclusivo, pausa/offscreen, movimento ridotto e autoplay rifiutato |
| Dipendenze | Audit durante installazione: zero vulnerabilita segnalate nelle app provate |

I test del generatore compongono tutte le 11 combinazioni, mentre le installazioni/build locali complete coprono le quattro righe rappresentative elencate. La CI e configurata per tutte le combinazioni, ma non e stata eseguita su GitHub in questa sessione.

Le unit suite contengono 11 test comuni dopo l'aggiunta dei test video; i preset workspace aggiungono 2 test. Le suite complete dei preset sono state eseguite prima dell'ultima aggiunta di soli test video; i tre nuovi test comuni sono stati eseguiti sulla landing e sono inclusi in tutti i preset. Typecheck/lint finali verificati anche sul sito Supabase. Il coverage del perimetro esplicito servizi/helper e 100%; non equivale al 100% di tutta l'applicazione.

## Limiti e manutenzione

- Auth, email e Storage ospitati non sono stati esercitati contro un Supabase reale. La migrazione e le policy sono verificate con PostgreSQL/PGlite; completare la checklist live dell'app.
- Il provider generico e un contratto da implementare; il mock e uno strumento di sviluppo, non un backend.
- Il resolver e stato corretto per TypeScript 7/API 6 e per l'incompatibilita reale tra ESLint 10 e plugin Next. La major ESLint 9 genera un avviso di deprecazione: dettagli in dependencies.md.
- I browser test sono eseguiti in sequenza tra progetti per evitare collisioni sulla porta locale 3100.
- Nessun deploy, benchmark remoto o garanzia di costi del piano hosting.

Gli esempi verificati sono nella cartella sorella ../agent-ready-examples. Le app generate in precedenza restano indipendenti.

---

## Storico v0.1

# Verifica v0.1.0

Data: 25 settembre 2026. Ambiente locale Windows, Node.js; nessun progetto Supabase remoto collegato.

La verifica comprende test del generatore, TypeScript, lint, test SQL/RLS in PGlite e build del template. Una seconda app viene generata e installata dal lockfile per controllare che il risultato funzioni indipendentemente dal generatore.

I test PostgreSQL usano tre identita sintetiche e verificano isolamento proprietario, permessi admin, bucket privato, vincoli dei file e rate limiter. I test del generatore controllano manifest/branding, presenza delle istruzioni, esclusioni, destinazioni vuote, dry run e rifiuto delle sovrascritture/sovrapposizioni.

La verifica browser locale copre homepage e form pubblici, rendering mobile, redirect anonimi e risposta controllata quando Supabase non e configurato. I flussi autenticati reali, le email e gli URL firmati richiedono un nuovo progetto Supabase e restano nella checklist `template/docs/verification.md`.

## Esiti

| Controllo | Esito |
| --- | --- |
| Generatore | 5 test passati; 68 file generati |
| Template | TypeScript, lint, 4 test e build passati |
| App esterna `../agent-ready-demo` | `npm ci`, TypeScript, lint, 4 test e build passati |
| Dipendenze installate | `npm audit` durante installazione: 0 vulnerabilita segnalate |
| Homepage desktop / mobile 390x844 | Rendering e navigazione verificati con agent-browser |
| Login mobile | Nessun overflow orizzontale; errore comprensibile e pulsante riabilitato con provider assente |
| Aree account/admin anonime | Redirect al login; risposte `private, no-store` |
| API auth | Origine estranea 403, input invalido 400, payload eccessivo 413, provider assente 503 |
| API documenti senza configurazione | 503 controllato |

I redirect delle pagine possono essere trasmessi nello stream HTML con status iniziale 200; e stato verificato anche il comportamento nel browser, non solo lo status HTTP. Nessun dato riservato viene renderizzato prima delle guardie server.

La demo ha le stesse sorgenti del template, salvo nome/branding/manifest di provenienza. L'ultima correzione al componente video opzionale e stata applicata a entrambi e riverificata con il check completo del template. Non sono state misurate le prestazioni di un deploy remoto e non sono stati eseguiti flussi autenticati contro un Supabase reale. Il video opzionale richiede la prova con gli asset e le condizioni di rete della futura app.

Nota manutenzione: npm segnala deprecazione per ESLint 9; lint e build passano e l'audit non segnala vulnerabilita. Valutare il passaggio a ESLint 10 insieme alla compatibilita dei plugin, separatamente dalle dipendenze runtime.
