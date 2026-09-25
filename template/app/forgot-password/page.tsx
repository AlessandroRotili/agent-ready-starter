import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
export const metadata = {
  title: "Recupera password",
  robots: { index: false, follow: false },
};
export default function ForgotPassword() {
  return (
    <AuthShell title="Recupera l'accesso">
      <AuthForm action="forgot" />
    </AuthShell>
  );
}
