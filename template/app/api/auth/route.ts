import { sessionClient } from "@/lib/db/server";
import { siteOrigin } from "@/lib/env";
import { project } from "@/config/project";
import { authInput } from "@/lib/auth/validation";
import { safeNext } from "@/lib/auth/redirect";
import {
  assertOrigin,
  authenticated,
  body,
  HttpError,
  json,
  route,
} from "@/lib/http/server";

export const runtime = "nodejs";
export async function POST(request: Request) {
  return route(async () => {
    assertOrigin(request);
    const input = await body(request, authInput);
    const client = await sessionClient();
    if (!client)
      throw new HttpError(503, "Accesso temporaneamente non disponibile.");
    if (input.action === "login") {
      const { error } = await client.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });
      if (error)
        throw new HttpError(
          400,
          "Accesso non riuscito. Controlla email, password e conferma dell'indirizzo.",
        );
      return json({ redirect: safeNext(input.next ?? null) });
    }
    if (input.action === "signup") {
      if (!project.allowSignup)
        throw new HttpError(403, "Registrazione disponibile solo su invito.");
      const { error } = await client.auth.signUp({
        email: input.email,
        password: input.password,
        options: { emailRedirectTo: `${siteOrigin()}/auth/callback` },
      });
      if (error)
        throw new HttpError(
          400,
          "Registrazione non riuscita. Riprova tra poco.",
        );
      return json({
        message: "Controlla la tua email per confermare l'accesso.",
      });
    }
    if (input.action === "forgot") {
      const { error } = await client.auth.resetPasswordForEmail(input.email, {
        redirectTo: `${siteOrigin()}/auth/callback?next=/account/password`,
      });
      // Same answer regardless of whether the address exists.
      if (error && error.status && error.status >= 500)
        throw new HttpError(503, "Servizio temporaneamente non disponibile.");
      return json({
        message:
          "Se l'indirizzo e registrato, riceverai le istruzioni per continuare.",
      });
    }
    if (input.action === "reset") {
      await authenticated();
      const { error } = await client.auth.updateUser({
        password: input.password,
      });
      if (error)
        throw new HttpError(
          400,
          "Non e stato possibile aggiornare la password.",
        );
      return json({ message: "Password aggiornata.", redirect: "/account" });
    }
    const { error } = await client.auth.signOut();
    if (error) throw new HttpError(503, "Uscita non riuscita. Riprova.");
    return json({ redirect: "/login" });
  });
}
