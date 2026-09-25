import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { listPublicContent } from "@/services/content.server";
import { ServiceNotConfiguredError } from "@/lib/errors";
export const metadata = { title: "Contenuti" };
export default async function Content({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const raw = Number((await searchParams).page || 0),
    page = Number.isSafeInteger(raw) && raw >= 0 && raw <= 10000 ? raw : 0;
  let result;
  try {
    result = await listPublicContent(page);
  } catch (error) {
    if (!(error instanceof ServiceNotConfiguredError)) throw error;
  }
  return (
    <div className="shell">
      <SiteHeader />
      <main id="main" className="page">
        <h1>Contenuti</h1>
        {!result ? (
          <p>Contenuti non ancora disponibili.</p>
        ) : (
          <>
            <div className="grid">
              {result.entries.map((entry) => (
                <article className="card" key={entry.slug}>
                  <h2>
                    <Link href={`/content/${entry.slug}`}>{entry.title}</Link>
                  </h2>
                  <p>{entry.summary}</p>
                </article>
              ))}
            </div>
            {!result.entries.length && <p>Nessun contenuto pubblicato.</p>}
            <nav className="spaced" aria-label="Paginazione">
              {page > 0 && (
                <Link href={`/content?page=${page - 1}`}>Precedenti</Link>
              )}
              {result.hasMore && (
                <Link href={`/content?page=${page + 1}`}>Successivi</Link>
              )}
            </nav>
          </>
        )}
      </main>
    </div>
  );
}
