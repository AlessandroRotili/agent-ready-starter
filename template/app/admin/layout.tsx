import Link from "next/link";
import { requireAdmin } from "@/lib/auth/server";
import { Logout } from "@/components/logout";
import { project } from "@/config/project";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="shell">
      <header className="topbar">
        <Link className="brand" href="/">
          {project.name}
        </Link>
        <nav aria-label="Amministrazione">
          <Link href="/account">Area personale</Link>
          <Logout />
        </nav>
      </header>
      <main id="main" className="page">
        {children}
      </main>
    </div>
  );
}
