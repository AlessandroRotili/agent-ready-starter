import Link from "next/link";
import { project } from "@/config/project";
export function SiteHeader() {
  const fullsite = String(project.preset) === "fullsite";
  const dashboard = String(project.preset) !== "landing";
  return (
    <header className="topbar">
      <Link className="brand" href="/">
        {project.name}
      </Link>
      <nav aria-label="Navigazione principale">
        <Link href="/#about">Il progetto</Link>
        {fullsite && <Link href="/content">Contenuti</Link>}
        {dashboard && <Link href="/dashboard">Area di lavoro</Link>}
      </nav>
    </header>
  );
}
