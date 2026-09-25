# Setup

If starter.json selects runtime docker, follow docs/docker.md for installation, checks and production builds. The provider setup below is unchanged; containers do not provision a database.

The launcher resolves current stable Node/npm and installs a private toolchain when needed. Generation resolves stable npm package releases and writes exact versions; npm install creates the lockfile. Commit package-lock.json and use npm ci afterwards. Use the Node version in .node-version on CI and other machines.

## Data choices

- none/mock: no cloud account needed. Public pages work immediately. Mock workspace is only available in development and does not persist data.
- generic: implement repositories/content/generic.ts and private identity/workspace ports. DATABASE_URL is a server-only placeholder, not a working adapter. Add driver/ORM, schema, migrations and tests appropriate to the chosen database.
- Supabase: create an account/project at https://supabase.com/dashboard or use the separate project you provided in the wizard. Copy .env.example to .env.local if needed, set project URL and publishable key, and apply generated SQL migrations in order. The wizard never creates services or applies remote migrations.

## Supabase account module (dashboard/fullsite)

Configure the exact NEXT_PUBLIC_SITE_URL and allow `/auth/callback` redirects on that origin. Enable email/password as needed. For cross-browser confirmation/recovery, use these Supabase email template links:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup">Confirm email</a>
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Reset password</a>
```

Default PKCE callbacks require the initiating browser's verifier cookie. Configure SMTP and auth rate limits before inviting users. Disabling signup in UI also requires disabling signup in Supabase.

For the first admin, register/confirm a user and copy their UUID. Set SUPABASE_SECRET_KEY locally only for the operator script, preview `npm run admin:grant -- UUID`, then deliberately apply `npm run admin:grant -- UUID --apply`. Remove the privileged key afterwards; runtime does not require it.

## Environment and deployment

Run npm run doctor for selected-provider checks. NEXT_PUBLIC_SITE_URL is the exact origin for metadata/CSRF/auth redirects. NEXT_PUBLIC_MEDIA_ORIGIN is an optional allowlisted public media origin. Public variables are built into browser bundles: rebuild when changing them.

Create an independent hosting project. Never reuse another application's .vercel directory, credentials or production database. Configure origin/env before build; apply migrations deliberately and run the live checklist in testing.md. Check current hosting plan eligibility and limits separately from code optimizations.
