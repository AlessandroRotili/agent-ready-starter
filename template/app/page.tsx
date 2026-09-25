import Link from "next/link";
import { project } from "@/config/project";

export default function Home() {
  return (
    <div className="shell">
      <header className="topbar">
        <Link className="brand" href="/">
          {project.name}
        </Link>
        <nav aria-label="Navigazione principale">
          <Link href="/login">Accedi</Link>
          {project.allowSignup && (
            <Link href="/signup" className="button">
              Crea un account
            </Link>
          )}
        </nav>
      </header>
      <main id="main">
        <section className="hero">
          <p className="eyebrow">Il tuo spazio personale</p>
          <h1>
            Meno cose sparse.
            <br />
            Piu spazio per te.
          </h1>
          <p className="lead">
            {project.description} Ritrova i tuoi documenti e gestisci il tuo
            profilo in un unico posto.
          </p>
          <div className="actions">
            <Link className="button" href="/account">
              Entra nel tuo spazio
            </Link>
            {project.allowSignup && <Link href="/signup">Inizia da qui</Link>}
          </div>
        </section>
        <section className="grid" aria-label="Cosa puoi fare">
          <article className="card">
            <p className="eyebrow">01 / Account</p>
            <h2>Un profilo tutto tuo</h2>
            <p className="muted">
              Gestisci i tuoi dati e ritrova il tuo spazio quando ti serve.
            </p>
          </article>
          <article className="card">
            <p className="eyebrow">02 / Documenti</p>
            <h2>Quello che conta, vicino</h2>
            <p className="muted">
              Carica e scarica i tuoi file dalla tua area personale.
            </p>
          </article>
          <article className="card">
            <p className="eyebrow">03 / Accesso</p>
            <h2>I tuoi file restano tuoi</h2>
            <p className="muted">
              I documenti del tuo account sono accessibili soltanto a te.
            </p>
          </article>
        </section>
      </main>
      <footer>{project.name}</footer>
    </div>
  );
}
