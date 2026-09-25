import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { safeNext } from "@/lib/auth/redirect";
import { project } from "@/config/project";
export const metadata = {
  title: "Accedi",
  robots: { index: false, follow: false },
};
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <AuthShell title="Bentornato">
      {params.error && (
        <p className="notice error" role="alert">
          Il link non e valido o e scaduto. Richiedine uno nuovo.
        </p>
      )}
      <AuthForm
        action="login"
        next={safeNext(typeof params.next === "string" ? params.next : null)}
      />
      <div className="stack spaced">
        <Link href="/forgot-password">Password dimenticata?</Link>
        {project.allowSignup && <Link href="/signup">Crea un account</Link>}
      </div>
    </AuthShell>
  );
}
