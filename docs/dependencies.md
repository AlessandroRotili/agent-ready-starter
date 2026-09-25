# Versioni e compatibilita

Al 25 settembre 2026 la toolchain verificata usa Node 26.10.0, npm 12.1.0, Next 16.3.6, React 19.3.0 e Tailwind 4.3.3. Il wizard risolve le versioni stabili dal registry al momento della creazione; le installazioni successive usano il lockfile.

TypeScript 7.0.2 fornisce il compilatore nativo. L'alias `typescript: npm:@typescript/typescript6@6.0.2` fornisce l'API richiesta da Next/lint, mentre `@typescript/native: npm:typescript@7.0.2` fornisce tsc. E il percorso di compatibilita [documentato da Microsoft](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6-0).

ESLint 10.11 ha prodotto un errore reale nel plugin React di eslint-config-next 16.3.6 (`getFilename is not a function`). Per questo il resolver sceglie la patch piu recente di ESLint 9. npm segnala che tale major non e piu supportata: e un vincolo transitorio del tooling da rimuovere quando i plugin saranno compatibili, non una dipendenza runtime del prodotto. Non viene forzata un'installazione con peer dependency ignorate.

Vitest 5 usa la configurazione Oxc per JSX; i template includono il compilatore automatico JSX e jsdom aggiornato. npm 12 richiede una policy per gli script delle dipendenze: sono consentiti soltanto esbuild e unrs-resolver, necessari al tooling, anziche una wildcard.

`--versions tested` usa le versioni esatte dichiarate nel template senza interrogare il registry durante la generazione. npm install richiede comunque la rete/cache e crea il lockfile; questo flag non e una promessa di installazione completamente offline. Per riprodurre un'app esistente usare npm ci sul suo lockfile.

Gli archivi Node arrivano da nodejs.org e vengono confrontati con SHASUMS256.txt HTTPS. Viene verificato il digest, non una firma GPG separata. La toolchain resta locale; il Node/npm di sistema non vengono disinstallati o aggiornati.

Docker opzionale: Compose >=2.30 per env_file raw, motore Linux, immagine ufficiale node:<versione generata>-bookworm-slim. La versione Node coincide con .node-version; npm nell'immagine e fissato alla versione verificata 12.1.0. Il target browser fissa Playwright alla versione scelta nel manifest. Aggiornare questi pin insieme alle verifiche container; le immagini sono referenziate per tag, non digest immutabile. Il database non e incluso implicitamente.
