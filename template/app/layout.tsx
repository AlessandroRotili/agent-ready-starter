import type { Metadata } from "next";
import { project } from "@/config/project";
import { siteOrigin } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: { default: project.name, template: `%s | ${project.name}` },
  description: project.description,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={project.locale}>
      <body>
        <a className="skip-link" href="#main">
          Vai al contenuto
        </a>
        {children}
      </body>
    </html>
  );
}
