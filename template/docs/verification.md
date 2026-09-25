# Verification

## Automated

`npm run check` runs TypeScript, ESLint, Node tests and a production build without cloud credentials. Database tests create an isolated PGlite PostgreSQL instance, install the actual migration against Supabase infrastructure fixtures and verify:

- Fresh schema/profile trigger and private bucket limits.
- Users cannot read/change another user's profile or documents/storage paths.
- Users cannot grant themselves admin; editable names cannot change identity.
- Admin can list profiles but cannot read other users' private files or modify their profiles.
- Immutable file policy and metadata constraints.
- Atomic per-user rate counters, expiry and denial of direct/anonymous access.
- Safe redirects, exact same-origin writes and upload input limits.

These are real SQL/RLS tests, not an emulation of hosted Auth/Storage APIs. They do not validate email delivery, signed URL expiration or provider configuration.

## Live acceptance after setup

Use a dedicated test project and synthetic files/accounts. Verify desktop and mobile:

1. Signup, confirmation link, login, incorrect password, password recovery from a second browser, password change and logout.
2. Anonymous `/account` and `/admin` redirect; private APIs deny access. Normal users cannot enter admin or call its API.
3. User A uploads/downloads/deletes an allowed file. Reject files above 8 MiB and unsupported types. Reload and paginate the list.
4. User B cannot fetch/delete/download A's document, including direct Supabase calls. Test object paths, expired download URLs and retries after interrupted uploads.
5. Grant admin deliberately; verify profile directory and continued file isolation. Revoke membership and confirm access is removed.
6. Ensure personal responses cannot be cached publicly, cookies refresh correctly and no secrets appear in browser bundles/logs.
7. Verify navigation, keyboard focus, error/empty/loading states, mobile layout and console output. If adding media, follow `performance.md`.

Do not report live checks as passed until performed against the configured environment. Production launch, remote migrations and email sends are separate from local scaffold verification.
