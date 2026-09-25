import { AuthForm } from "@/components/auth-form";
import { requireUser } from "@/lib/auth/server";
export default async function Password() {
  await requireUser();
  return (
    <section className="card auth">
      <h1>Nuova password</h1>
      <AuthForm action="reset" />
    </section>
  );
}
