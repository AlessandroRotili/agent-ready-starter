# Data and access

Apply `supabase/migrations/202609250001_core.sql` once to a fresh Supabase project. Do not apply it to an existing business database without reviewing conflicts.

| Resource | Access |
| --- | --- |
| `auth.users` | Managed by Supabase Auth |
| `profiles` | Own read/name update; admin reads all profiles |
| `admin_members` | Read own membership; writes only via privileged operator |
| `documents` | Owner-only SELECT/INSERT/DELETE; no UPDATE |
| `private.user_limits` | Inaccessible directly to users; fixed-action RPC only |
| `private-documents` bucket | Private; owner UUID is first path segment; immutable objects |

Profile creation is an auth insert trigger. Admin membership is independent of editable profile/name and user metadata. `private.is_admin()` is a narrowly scoped security-definer function with an empty search path. Profile UPDATE grants only `display_name`.

Document paths are `<owner-uuid>/<document-uuid>.<allowed-extension>`. Database constraints bind owner, ID and MIME to this path. Accepted types: PDF, JPEG, PNG, WebP and plain text, up to 8 MiB per file. MIME validation is not antivirus/content inspection. Downloads are attachments; do not render arbitrary uploaded files as HTML.

The API minute limits are 20 preparations, 40 completions, 40 deletes, 60 downloads and 20 profile updates per user. Counters are atomic Postgres upserts, shared by all app instances. These protect application endpoints, not hard storage quotas: a user with a session can call permitted Supabase APIs directly. Budget/quota enforcement and malware scanning require additional policies/services if the product needs them.

Interrupted uploads can leave objects without metadata. Review the private bucket against `documents.storage_path` and remove stale orphans with a deliberate maintenance operation after a grace period. No cleanup cron runs by default. Account deletion requires coordinated storage cleanup; a cascading metadata foreign key does not delete file bytes.

Tests execute the actual migration in PGlite with Supabase infrastructure fixtures. They verify SQL/RLS, not hosted Storage/Auth behavior. Live checks are in `verification.md`.
