# 0001 - Compose presets and provider adapters

Use a common Next.js/TypeScript/Tailwind foundation and compose landing/dashboard/fullsite routes with none/mock/generic/Supabase providers. Each result is independent source, not a proprietary runtime.

Services depend on contracts. Generic adapters fail closed until implemented. Mocks are development-only and disposable. Supabase is optional; landing projects do not inherit account/admin/document modules merely because they use a content database.

Resolve stable dependencies at generation, pin exact versions, then commit the lockfile. Future latest releases are not assumed compatible: installation/check failures are reported rather than bypassed with legacy peer-dependency flags. An explicitly selected tested version set is available for reproducibility.

Compatibility as of 2026-09-25: TypeScript 7 supplies tsc through the @typescript/native npm alias, while the official @typescript/typescript6 compatibility package supplies the programmatic API expected by Next/lint. ESLint resolves the newest version in major 9 because the React/import/accessibility plugins bundled by the current Next config crash under ESLint 10. This exception is explicit and tested; do not remove it until the complete check passes. Node/npm/Next/React/Tailwind still resolve their current stable releases.
