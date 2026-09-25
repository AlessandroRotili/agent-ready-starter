import { z } from "zod";
import {
  assertOrigin,
  authenticated,
  body,
  HttpError,
  json,
  limit,
  route,
} from "@/lib/http/server";

export async function PATCH(request: Request) {
  return route(async () => {
    assertOrigin(request);
    const { client, user } = await authenticated();
    const input = await body(
      request,
      z.object({ displayName: z.string().trim().max(100) }).strict(),
    );
    await limit(client, "profile-update");
    const { error } = await client
      .from("profiles")
      .update({ display_name: input.displayName })
      .eq("id", user.id);
    if (error) throw new HttpError(500, "Salvataggio non riuscito.");
    return json({ message: "Profilo aggiornato." });
  });
}
