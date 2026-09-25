import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { findPublicContent } from "@/services/content.server";
import { ServiceNotConfiguredError } from "@/lib/errors";
async function find(slug: string) {
  try {
    return await findPublicContent(slug);
  } catch (error) {
    if (error instanceof ServiceNotConfiguredError) return null;
    throw error;
  }
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const entry = await find((await params).slug);
  return { title: entry?.title ?? "Contenuto", description: entry?.summary };
}
export default async function Detail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const entry = await find((await params).slug);
  if (!entry) notFound();
  return (
    <div className="shell">
      <SiteHeader />
      <main id="main" className="page">
        <article>
          <h1>{entry.title}</h1>
          <p className="lead">{entry.summary}</p>
          <div className="whitespace-pre-wrap">{entry.body}</div>
        </article>
      </main>
    </div>
  );
}
