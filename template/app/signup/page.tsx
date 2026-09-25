import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { project } from "@/config/project";
export const metadata = {
  title: "Crea account",
  robots: { index: false, follow: false },
};
export default function Signup() {
  return (
    <AuthShell title="Il tuo nuovo spazio">
      {project.allowSignup ? (
        <AuthForm action="signup" />
      ) : (
        <p>La registrazione e disponibile solo su invito.</p>
      )}
      <p className="spaced">
        <Link href="/login">Hai gia un account? Accedi</Link>
      </p>
    </AuthShell>
  );
}
