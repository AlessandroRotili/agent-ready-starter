import { project } from "@/config/project";
import { SiteHeader } from "@/components/layout/site-header";
import { DemoWorkspace } from "@/components/workspace/demo-workspace";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Area di lavoro",
  robots: { index: false, follow: false },
};
export default function Dashboard() {
  const mock =
    String(project.provider) === "mock" &&
    process.env.NODE_ENV === "development";
  return (
    <div className="shell">
      <SiteHeader />
      <main id="main" className="page">
        <p className="eyebrow">Area di lavoro</p>
        <h1>Organizza il tuo progetto.</h1>
        {mock ? (
          <>
            <p className="notice" role="status">
              Demo locale: dati sintetici, nessuna autenticazione. Le modifiche
              si perdono ricaricando la pagina.
            </p>
            <DemoWorkspace />
          </>
        ) : (
          <section className="card">
            <h2>Area da configurare</h2>
            <p>
              Collega identita e database per attivare questa area. La demo mock
              e disponibile solo con il server di sviluppo.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
