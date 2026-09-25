import { randomUUID } from "node:crypto";
import {
  documentPath,
  MAX_DOCUMENT_BYTES,
  uploadInput,
} from "@/lib/media/documents";
import {
  assertOrigin,
  authenticated,
  body,
  HttpError,
  json,
  limit,
  route,
} from "@/lib/http/server";

export const runtime = "nodejs";
export async function GET(request: Request) {
  return route(async () => {
    const { client, user } = await authenticated();
    const raw = Number(new URL(request.url).searchParams.get("page") || 0);
    const page = Number.isInteger(raw) && raw >= 0 ? Math.min(raw, 10000) : 0;
    const { data, error } = await client
      .from("documents")
      .select("id,name,byte_size,created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .order("id")
      .range(page * 20, page * 20 + 20);
    if (error) throw new HttpError(500, "Impossibile caricare i documenti.");
    return json({ documents: data.slice(0, 20), hasMore: data.length > 20 });
  });
}
export async function POST(request: Request) {
  return route(async () => {
    assertOrigin(request);
    const { client, user } = await authenticated();
    const input = await body(request, uploadInput);
    const storage = client.storage.from("private-documents");
    if (input.action === "prepare") {
      await limit(client, "document-upload");
      const id = randomUUID();
      const path = documentPath(user.id, id, input.type);
      const { data, error } = await storage.createSignedUploadUrl(path, {
        upsert: false,
      });
      if (error || !data)
        throw new HttpError(500, "Preparazione upload non riuscita.");
      return json({ id, path, token: data.token });
    }
    await limit(client, "document-complete");
    const path = documentPath(user.id, input.id, input.type);
    const { data: existing } = await client
      .from("documents")
      .select("id")
      .eq("id", input.id)
      .eq("owner_id", user.id)
      .maybeSingle();
    if (existing) return json({ id: existing.id });
    const filename = path.split("/")[1];
    const { data: objects, error: listError } = await storage.list(user.id, {
      search: filename,
      limit: 2,
    });
    const file = objects?.find((item) => item.name === filename);
    if (
      listError ||
      !file?.metadata?.size ||
      file.metadata.size > MAX_DOCUMENT_BYTES ||
      file.metadata.mimetype !== input.type
    ) {
      throw new HttpError(
        400,
        "File incompleto o non valido. Riprova il caricamento.",
      );
    }
    const { error } = await client
      .from("documents")
      .insert({
        id: input.id,
        owner_id: user.id,
        name: input.name,
        storage_path: path,
        content_type: input.type,
        byte_size: file.metadata.size,
      });
    if (error && error.code !== "23505")
      throw new HttpError(500, "Salvataggio documento non riuscito.");
    if (error) {
      const { data: own } = await client
        .from("documents")
        .select("id")
        .eq("id", input.id)
        .eq("owner_id", user.id)
        .maybeSingle();
      if (!own) throw new HttpError(409, "Caricamento non riuscito. Riprova.");
    }
    return json({ id: input.id }, 201);
  });
}
