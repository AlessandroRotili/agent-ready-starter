import { z } from "zod";
import {
  assertOrigin,
  authenticated,
  HttpError,
  json,
  limit,
  route,
} from "@/lib/http/server";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return route(async () => {
    assertOrigin(request);
    const { client, user } = await authenticated();
    const parsed = z.uuid().safeParse((await context.params).id);
    if (!parsed.success) throw new HttpError(400, "Documento non valido.");
    await limit(client, "document-delete");
    const { data, error } = await client
      .from("documents")
      .select("storage_path")
      .eq("id", parsed.data)
      .eq("owner_id", user.id)
      .maybeSingle();
    if (error) throw new HttpError(500, "Operazione non riuscita.");
    if (!data) throw new HttpError(404, "Documento non trovato.");
    const { error: storageError } = await client.storage
      .from("private-documents")
      .remove([data.storage_path]);
    if (storageError)
      throw new HttpError(500, "Eliminazione file non riuscita.");
    const { error: deleteError } = await client
      .from("documents")
      .delete()
      .eq("id", parsed.data)
      .eq("owner_id", user.id);
    if (deleteError)
      throw new HttpError(500, "Eliminazione documento non riuscita. Riprova.");
    return json({ message: "Documento eliminato." });
  });
}
