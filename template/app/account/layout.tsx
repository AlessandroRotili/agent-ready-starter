import Link from "next/link";
import { requireUser, isAdmin } from "@/lib/auth/server";
import { project } from "@/config/project";
import { Logout } from "@/components/logout";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const admin = await isAdmin(user.id);
  return (
    <div className="shell">
      <header className="topbar">
        <Link className="brand" href="/">
          {project.name}
        </Link>
        <nav aria-label="Area personale">
          <Link href="/account">Il mio spazio</Link>
          <Link href="/account/password">Password</Link>
          {admin && <Link href="/admin">Amministrazione</Link>}
          <Logout />
        </nav>
      </header>
      <main id="main" className="page">
        {children}
      </main>
    </div>
  );
}
