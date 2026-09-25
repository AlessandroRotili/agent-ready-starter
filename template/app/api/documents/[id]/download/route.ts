import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticated, HttpError, limit, route } from "@/lib/http/server";
import { privateHeaders } from "@/lib/http/security";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return route(async () => {
    const { client, user } = await authenticated();
    const id = z.uuid().safeParse((await context.params).id);
    if (!id.success) throw new HttpError(400, "Documento non valido.");
    await limit(client, "document-download");
    const { data, error } = await client
      .from("documents")
      .select("storage_path,name")
      .eq("id", id.data)
      .eq("owner_id", user.id)
      .maybeSingle();
    if (error) throw new HttpError(500, "Operazione non riuscita.");
    if (!data) throw new HttpError(404, "Documento non trovato.");
    const { data: signed, error: signError } = await client.storage
      .from("private-documents")
      .createSignedUrl(data.storage_path, 60, { download: data.name });
    if (signError || !signed)
      throw new HttpError(500, "Download non disponibile.");
    return NextResponse.redirect(signed.signedUrl, {
      status: 302,
      headers: privateHeaders,
    });
  });
}
