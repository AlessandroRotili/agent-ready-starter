import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sessionClient } from "@/lib/db/server";
import { siteOrigin } from "@/lib/env";
import { privateHeaders, sameOrigin } from "./security";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: privateHeaders });
}
export async function route(work: () => Promise<Response>) {
  try {
    return await work();
  } catch (error) {
    if (error instanceof HttpError)
      return json({ error: error.message }, error.status);
    // Do not log credentials, cookies, request bodies, signed URLs or provider payloads.
    console.error(
      "API operation failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return json({ error: "Operazione non riuscita. Riprova tra poco." }, 500);
  }
}
export function assertOrigin(request: Request) {
  if (!sameOrigin(request, siteOrigin()))
    throw new HttpError(403, "Richiesta non consentita.");
}
export async function body<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new HttpError(415, "Formato richiesta non valido.");
  if (Number(request.headers.get("content-length")) > 16384)
    throw new HttpError(413, "Richiesta troppo grande.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Dati non validi.");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 16384) {
        await reader.cancel();
        throw new HttpError(413, "Richiesta troppo grande.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const text = Buffer.concat(chunks).toString("utf8");
  let input: unknown;
  try {
    input = JSON.parse(text);
  } catch {
    throw new HttpError(400, "Dati non validi.");
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new HttpError(400, "Controlla i dati inseriti.");
  return parsed.data;
}
export async function authenticated() {
  const client = await sessionClient();
  if (!client)
    throw new HttpError(503, "Servizio temporaneamente non disponibile.");
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new HttpError(401, "Accedi per continuare.");
  return { client, user: data.user };
}
export async function limit(
  client: NonNullable<Awaited<ReturnType<typeof sessionClient>>>,
  action: string,
) {
  const { data, error } = await client.rpc("consume_user_limit", {
    p_action: action,
  });
  if (error)
    throw new HttpError(503, "Servizio temporaneamente non disponibile.");
  if (!data)
    throw new HttpError(429, "Troppi tentativi. Riprova tra un minuto.");
}
