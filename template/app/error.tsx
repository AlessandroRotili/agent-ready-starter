"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main" className="auth card">
      <h1>Qualcosa non ha funzionato.</h1>
      <p>Riprova tra poco.</p>
      <button onClick={reset}>Riprova</button>
    </main>
  );
}
