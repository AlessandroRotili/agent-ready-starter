# Testing strategy

For Docker projects use the equivalent commands in docker.md. The integration owner runs the final full gate once; delegated workers run the targeted tests assigned in their task packet and return results. Repeat full checks only after changes, failures or unresolved concerns. Documentation-only changes need content/link review.

`npm run check` runs route type generation, TypeScript, ESLint, Vitest with coverage, applicable provider integration tests, and a production build. The default tests do not use production credentials or send emails.

| Level | Command / purpose |
| --- | --- |
| Unit | npm test: domain/service rules, failures and security helpers |
| Component | Included in Vitest: jsdom + Testing Library, user-visible behavior |
| Coverage | npm run test:coverage: services/security/media naming, 90% lines/functions/statements and 80% branches |
| SQL/RLS | npm run test:integration when Supabase account module is present; isolated PGlite |
| Browser | npm run test:e2e: desktop/mobile Playwright journeys |

Install Chromium once with npm run test:e2e:install. CI also installs Linux browser dependencies. Async Server Components are covered through browser/integration tests, not by assuming synchronous component tests cover them. Unit tests inject repositories and do not call cloud APIs.

For every feature, test its actual risk: ownership, invalid inputs, duplicate submission, failed providers, cache invalidation and idempotency when applicable. Add new business files to the coverage scope. Coverage is a signal, not proof of correctness. Never claim live Supabase Auth, SMTP or Storage verification from PGlite tests.

Before launch with a real backend: signup/confirmation/recovery/logout, two-user isolation, admin denial, upload/download/delete, expired signed URLs and role revocation must all be checked on a dedicated test project. Exercise mock/generic production states: mocks must remain inactive and missing infrastructure must fail closed.

Sources: [Vitest coverage](https://vitest.dev/guide/coverage), [Next.js Vitest guide](https://nextjs.org/docs/app/guides/testing/vitest).
