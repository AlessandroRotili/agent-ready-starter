# Routes and APIs

| Route | Access / behavior |
| --- | --- |
| `/` | Static public homepage |
| `/login`, `/signup`, `/forgot-password` | Public auth forms |
| `/auth/callback` | PKCE code exchange; safe internal redirect |
| `/auth/confirm` | Email token hash verification for signup/recovery |
| `/account` | Authenticated profile and private files |
| `/account/password` | Authenticated password change/recovery destination |
| `/admin` | Admin membership required; profile directory |

| API | Contract |
| --- | --- |
| `POST /api/auth` | Discriminated `action`: login, signup, forgot, reset, logout |
| `PATCH /api/profile` | `{ displayName }`, own user only |
| `GET /api/documents?page=0` | Own metadata, 20 rows/page |
| `POST /api/documents` | `prepare`: name/type/size -> id/path/token; `complete`: id/name/type -> metadata persistence |
| `DELETE /api/documents/[id]` | Owner-only storage and metadata deletion |
| `GET /api/documents/[id]/download` | Owner-only redirect to short-lived attachment URL |
| `GET /api/admin/users?page=0` | Admin-only paginated profiles; no email addresses/private files |

Errors use `{ error: string }` and HTTP status: 400 input, 401 unauthenticated, 403 forbidden/origin, 404 inaccessible resource, 413 size, 415 content type, 429 rate limit, 503 provider/config unavailable. Unexpected errors return a generic 500. Responses use `private, no-store`.

Browser mutations require JSON and an exact `Origin` match to `NEXT_PUBLIC_SITE_URL`. Configure a correct origin for each environment. Signup and recovery return generic messages to limit account enumeration; Supabase Auth handles authentication endpoint rate limits. Internal redirects only allow `/account` and `/admin` paths, and those destinations enforce their own permissions.
