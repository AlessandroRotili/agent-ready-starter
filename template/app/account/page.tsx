import { requireUser } from "@/lib/auth/server";
import { sessionClient } from "@/lib/db/server";
import { ProfileForm } from "@/components/profile-form";
import { Documents } from "@/components/documents";
export const metadata = { title: "Il mio spazio" };
export default async function Account() {
  const user = await requireUser();
  const client = (await sessionClient())!;
  const { data, error } = await client
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();
  if (error) throw new Error("Profile unavailable");
  return (
    <>
      <p className="eyebrow">Area personale</p>
      <h1>Il tuo spazio.</h1>
      <p className="lead">Profilo e documenti, a portata di mano.</p>
      <div className="grid">
        <section className="card">
          <h2>Il tuo profilo</h2>
          <ProfileForm
            displayName={data.display_name}
            email={user.email || ""}
          />
        </section>
        <section className="card">
          <h2>I tuoi documenti</h2>
          <Documents />
        </section>
      </div>
    </>
  );
}
