# Architecture

Next.js App Router with explicit route handlers. React Server Components render public pages and authorize protected pages. Small Client Components handle forms and lists. CSS is local, with tokens in `app/globals.css`.

| Area | Owner |
| --- | --- |
| Public content | `app/page.tsx`, `config/project.ts` |
| User identity/session | `lib/auth`, `lib/db`, `proxy.ts` |
| Browser interactions | `components` |
| HTTP validation/errors/limits | `lib/http` |
| Private file contracts | `lib/media/documents.ts` |
| Database rules | `supabase/migrations` |
| Operational commands | `scripts` |

Supabase is the source of truth for identities, profiles, admin membership and document metadata. File objects are in a private Supabase bucket. No service-role client exists in application runtime: ordinary and admin reads use the authenticated session and RLS.

`proxy.ts` refreshes sessions only on auth/account/admin/API routes. It does not protect data on its own. Server guards call `getUser`; APIs verify identity, permission and ownership. The public homepage stays static. All API/auth responses are private and non-cacheable.

Document flow: authenticated prepare API -> signed direct browser upload -> completion API verifies stored size/type and records metadata. Downloads authorize the owner and issue a 60-second signed URL. Pagination requests at most 21 rows, returning 20 plus a next-page flag.

The admin directory only lists profiles. It cannot read another user's documents, impersonate users, modify privileges or delete accounts. Adding those capabilities needs a separate design and tests.

Optional modules should be introduced as feature folders with their own migration, routes, UI and tests. The base must not import event/music/gallery business rules. Avoid a generic plugin runtime until multiple applications require it.

References: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [Next.js proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).
