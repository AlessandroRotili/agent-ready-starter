import { requireAdmin } from "@/lib/auth/server";
import { AdminUsers } from "@/components/admin-users";
export const metadata = { title: "Amministrazione" };
export default async function Admin() {
  await requireAdmin();
  return (
    <>
      <p className="eyebrow">Amministrazione</p>
      <h1>Utenti dell&apos;applicazione.</h1>
      <p className="lead">
        Consulta i profili registrati. I documenti rimangono privati per ciascun
        utente.
      </p>
      <section className="card">
        <AdminUsers />
      </section>
    </>
  );
}
