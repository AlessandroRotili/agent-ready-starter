# Providers and extension points

| Choice | Behavior | Next step |
| --- | --- | --- |
| none | Public local editorial data; no DB dependency | Edit content/entries.ts |
| mock | Local public data and disposable browser workspace in development | Define real domain/auth before production |
| generic | Typed DB/auth ports; unconfigured services fail closed | Implement adapters for your SQL/HTTP/provider |
| supabase | Public-content adapter, migration; account/auth module on dashboard/fullsite | Configure project, apply migrations and verify live flows |

`repositories/content/selected.ts` is the composition point. A custom DB adapter must implement ContentRepository with bounded queries and publication filters. A custom private workspace also needs IdentityService and WorkspaceRepository: identity must be verified server-side before querying an owner-scoped resource. No database engine or ORM is imposed by the generic choice.

To add a provider: implement and contract-test its repository, wire selected.ts, document environment variables, add migrations/access policies and run the same service tests. Do not switch UI components to provider SDK calls. Generic stubs return a configuration error, never fake success.

For Supabase, apply all generated migrations in filename order on a separate project. `content_entries` is public only when published; publishing initially happens via an operator DB action. There is no generic CMS editor yet. Add an authenticated editor, appropriate RLS policies and `revalidateTag('public-content', 'max')` after successful writes when needed. For immediate expiration use the current Next.js API appropriate to the mutation context, with a regression test.

Account module: profiles belong to auth.users; admin_members is operator-controlled; documents and private storage belong to a user UUID. Normal users cannot promote themselves. Admin directory access does not imply access to private files. The account module currently keeps its existing explicit auth/document routes rather than pretending every auth provider has identical capabilities.

Email, payment, analytics, queues and organization tenancy are not installed. Add them only with explicit requirements, provider configuration and tests.
