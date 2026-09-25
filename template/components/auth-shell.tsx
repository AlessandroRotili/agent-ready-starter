import Link from "next/link";
import { project } from "@/config/project";
export function AuthShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main id="main" className="auth">
      <Link className="brand" href="/">
        {project.name}
      </Link>
      <section className="card spaced">
        <h1>{title}</h1>
        {children}
      </section>
    </main>
  );
}
