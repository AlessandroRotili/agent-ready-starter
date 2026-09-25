import type { Metadata } from "next";
import { project } from "@/config/project";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: project.name, template: `%s | ${project.name}` },
  description: project.description,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
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
