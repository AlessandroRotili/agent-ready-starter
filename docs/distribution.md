# Distribuzione senza clone

## Scelta consigliata

Pubblica `agent-ready-starter` come repository GitHub pubblico. La repository contiene il sorgente e i test; ogni tag `vX.Y.Z` crea una Release con tre asset:

- `install-agent-ready.ps1`: unico file necessario all'utente Windows;
- `agent-ready-starter-vX.Y.Z.zip`: runtime minimale dello scaffold;
- `agent-ready-starter-vX.Y.Z.zip.sha256`: checksum consultabile separatamente.

L'archivio include bootstrap, CLI, moduli, template e documentazione. Esclude esempi, test/manutenzione, `.runtime`, dipendenze, cache, output, `.env` privati, lockfile e file generati del template legacy. La pubblicazione è gestita da `.github/workflows/release.yml`. GitHub consente il download non autenticato degli asset di una release pubblica; una repository privata richiede un diverso flusso autenticato e non è supportata da questo installer.

## Prima pubblicazione

La cartella dello starter è già una repository Git locale sul branch `main`, senza commit e senza remote. Dopo avere creato o autenticato il tuo account GitHub:

```powershell
cd C:\Users\alessandro.rotili\wildwingsband\agent-ready-starter
git branch -M main
git add .
git commit -m "Initial agent-ready starter"
gh auth login
gh repo create agent-ready-starter --public --source . --remote origin --push
git tag v0.3.0
git push origin v0.3.0
```

Il push del tag esegue i test, controlla che il tag coincida con `package.json`, costruisce l'archivio, genera il checksum, inserisce repository/versione/hash nell'installer e pubblica la Release. Non creare il tag finché il workflow normale non è verde. Se il nome scelto per la repository cambia, non devi modificare lo script: il workflow usa automaticamente `owner/repository` del progetto GitHub.

Prima del commit è stato eseguito un controllo locale per chiavi private, token GitHub/OpenAI, password e segreti Supabase/Brevo/Cron: non sono emerse credenziali. `template/.env.example` contiene soltanto valori vuoti e localhost. `.runtime`, `node_modules`, `.next`, file TypeScript generati e `dist` sono ignorati. Controlla comunque sempre `git status --short --ignored` prima di ogni primo push.

Per una nuova versione, aggiorna `package.json`, changelog e test; effettua commit e push; poi crea e pubblica il nuovo tag. Non riutilizzare o spostare tag già pubblicati.

## Uso su un'altra macchina Windows

Scarica il singolo installer dalla release più recente, ispezionalo e avvialo dalla cartella in cui vuoi lavorare:

```powershell
$installer = Join-Path $env:TEMP 'install-agent-ready.ps1'
Invoke-WebRequest 'https://github.com/OWNER/agent-ready-starter/releases/latest/download/install-agent-ready.ps1' -OutFile $installer
Get-Content $installer -TotalCount 30
& $installer
```

Sostituisci `OWNER` una sola volta con l'account GitHub. Il wizard chiede se creare il progetto nella cartella corrente o altrove. Non servono `git clone`, Node o npm: l'installer scarica il runtime verificato in `%LOCALAPPDATA%\AgentReadyStarter\versions`, poi il bootstrap prepara Node/npm nella cache di quella versione. I progetti generati rimangono indipendenti.

Al secondo avvio puoi riusare lo stesso file: archivio e toolchain vengono riutilizzati. Gli argomenti della CLI possono essere inoltrati, per esempio:

```powershell
& $installer --cwd --yes --name mio-prodotto --preset landing --provider none --docker
```

La destinazione corrente deve essere vuota. L'installer non aggiorna da solo una versione già scaricata e non esegue mai `git clone`. Per cambiare versione scarica l'installer della nuova Release. La verifica SHA-256 protegge l'archivio rispetto all'hash incorporato nell'installer; devi comunque scaricare e controllare l'installer dal repository GitHub atteso.

## Prova locale del pacchetto

`npm run package:release -- --output PERCORSO_VUOTO --version v0.3.0` prepara i file senza pubblicarli. Il workflow è la fonte canonica per ZIP e installer finali. Le verifiche sono documentate in `docs/verification.md`.

Fonti: [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository), [GitHub Release assets API](https://docs.github.com/en/rest/releases/assets).
