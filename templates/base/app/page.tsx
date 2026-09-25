import Link from "next/link";
import { project } from "@/config/project";
import { SiteHeader } from "@/components/layout/site-header";
export default function Home() {
  const workspace = String(project.preset) !== "landing";
  return (
    <div className="shell">
      <SiteHeader />
      <main id="main">
        <section className="hero">
          <p className="eyebrow">{project.name}</p>
          <h1>Le tue idee, uno spazio per crescere.</h1>
          <p className="lead">{project.description}</p>
          <div className="actions">
            <Link className="button" href={workspace ? "/dashboard" : "#about"}>
              {workspace ? "Apri area di lavoro" : "Scopri il progetto"}
            </Link>
            {String(project.preset) === "fullsite" && (
              <Link href="/content">Esplora i contenuti</Link>
            )}
          </div>
        </section>
        <section id="about" className="grid pb-16" aria-label="Il progetto">
          <article className="card">
            <h2>Una direzione chiara</h2>
            <p>Racconta il valore del tuo prodotto e a chi si rivolge.</p>
          </article>
          <article className="card">
            <h2>Esperienze semplici</h2>
            <p>
              Organizza servizi, informazioni e percorsi attorno alle persone.
            </p>
          </article>
          <article className="card">
            <h2>Spazio per evolvere</h2>
            <p>Costruisci le funzionalita che servono, un passo alla volta.</p>
          </article>
        </section>
      </main>
      <footer>{project.name}</footer>
    </div>
  );
}
