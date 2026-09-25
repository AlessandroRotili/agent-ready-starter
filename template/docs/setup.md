# Setup and deployment

## Local app

1. Install Node.js 22+, run `npm ci`, copy `.env.example` to `.env.local`.
2. Create a separate Supabase project for this application. Never reuse credentials/data from the source application.
3. Set `NEXT_PUBLIC_SITE_URL` to the exact app origin, initially `http://localhost:3000`; set the Supabase URL and publishable key (legacy anon key also works).
4. Apply `supabase/migrations/202609250001_core.sql` using the Supabase SQL editor or a separately configured Supabase CLI migration workflow. The scaffold itself does not connect or apply migrations.
5. Configure Auth Site URL and allowed redirect URLs for `/auth/callback` on the local and production origins. Enable email/password signup and email confirmation as required.
6. Run `npm run doctor`, `npm run check`, then `npm run dev`.

For email links usable across browsers, configure Supabase templates explicitly:

```html
<!-- Confirm signup -->
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup">Confirm email</a>
<!-- Reset password -->
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Reset password</a>
```

Use environment-specific Site URLs/projects when testing emails. Default PKCE `/auth/callback` links require the initiating browser's verifier cookie. Configure SMTP delivery and Auth rate limits in Supabase before public signup. With `allowSignup: false`, also disable public signup in Supabase; hiding a form does not disable the provider API. No newsletter/email campaign provider is included.

## First admin

Register and confirm a user. Copy their UUID from Supabase Auth. Temporarily set `SUPABASE_SECRET_KEY` to the server secret (or legacy service-role key) in your local `.env.local`, then:

```sh
npm run admin:grant -- USER_UUID
npm run admin:grant -- USER_UUID --apply
```

The first command previews the target; the second verifies the user and grants membership. Remove the privileged key afterwards. Application runtime and deployment do not require it. Never put it in a `NEXT_PUBLIC_*` variable.

## Environment

| Variable | Where used |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin, email redirects, browser-write origin checks |
| `NEXT_PUBLIC_SUPABASE_URL` | Session clients and allowed public-image hostname |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public session client key; never privileged |
| `SUPABASE_SECRET_KEY` | Manual admin bootstrap script only |

Public variables are captured during build; rebuild after changing them. Keep `.env.local` out of version control.

## Vercel or another Next.js host

Create a new hosting project for the generated app, set its environment variables before building and configure its own Supabase redirects. Do not copy `.vercel` links from another project. `npm run build` / `npm start` also works on a Node.js host. Preview environments need their own exact origin for form submissions; do not trust arbitrary forwarded hosts for security checks.

Run the live checklist in `verification.md` before launching. Check the chosen hosting plan's current eligibility and quotas separately: efficient defaults cannot guarantee a free tier for every use case. Monitor hosting transfer and Supabase storage/egress separately.
