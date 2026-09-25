import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="auth card">
      <h1>Pagina non trovata.</h1>
      <Link href="/">Torna alla home</Link>
    </main>
  );
}
