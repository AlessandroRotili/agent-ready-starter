"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { browserClient } from "@/lib/db/browser";
import { documentTypes, MAX_DOCUMENT_BYTES } from "@/lib/media/documents";
import { jsonRequest, requestJson } from "@/lib/http/client";
type Document = {
  id: string;
  name: string;
  byte_size: number;
  created_at: string;
};
type Listing = { documents: Document[]; hasMore: boolean };
export function Documents() {
  const [listing, setListing] = useState<Listing>({
    documents: [],
    hasMore: false,
  });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    requestJson(`/api/documents?page=${page}`, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) {
          setListing(data);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setError(error.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [page]);
  async function refresh() {
    setListing(await requestJson(`/api/documents?page=${page}`));
  }
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const file = new FormData(event.currentTarget).get("file");
      if (
        !(file instanceof File) ||
        !file.size ||
        file.size > MAX_DOCUMENT_BYTES ||
        !Object.hasOwn(documentTypes, file.type)
      )
        throw new Error("Scegli un PDF, testo o immagine fino a 8 MB.");
      const signed = await requestJson(
        "/api/documents",
        jsonRequest("POST", {
          action: "prepare",
          name: file.name,
          type: file.type,
          size: file.size,
        }),
      );
      const { error: uploadError } = await browserClient()
        .storage.from("private-documents")
        .uploadToSignedUrl(signed.path, signed.token, file, {
          contentType: file.type,
          cacheControl: "0",
        });
      if (uploadError) throw new Error("Caricamento non riuscito. Riprova.");
      await requestJson(
        "/api/documents",
        jsonRequest("POST", {
          action: "complete",
          id: signed.id,
          name: file.name,
          type: file.type,
        }),
      );
      formRef.current?.reset();
      if (page) {
        setLoading(true);
        setPage(0);
      } else await refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Caricamento non riuscito.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {
    if (!window.confirm("Eliminare questo documento?")) return;
    setBusy(true);
    setError("");
    try {
      await requestJson(`/api/documents/${id}`, { method: "DELETE" });
      if (page && listing.documents.length === 1) {
        setLoading(true);
        setPage(page - 1);
      } else await refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Eliminazione non riuscita.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <form ref={formRef} onSubmit={upload} className="stack">
        <label>
          Aggiungi un documento
          <input
            name="file"
            type="file"
            required
            accept={Object.keys(documentTypes).join(",")}
          />
        </label>
        <small>
          PDF, TXT, JPG, PNG o WebP. Massimo 8 MB. Visibile solo a te.
        </small>
        <button disabled={busy}>
          {busy ? "Attendi..." : "Carica documento"}
        </button>
      </form>
      {error && (
        <p role="alert" className="notice error spaced">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status" className="spaced">
          Caricamento...
        </p>
      ) : (
        <>
          <ul className="file-list">
            {listing.documents.map((item) => (
              <li key={item.id}>
                <div>
                  <a href={`/api/documents/${item.id}/download`}>{item.name}</a>
                  <small>{Math.ceil(item.byte_size / 1024)} KB</small>
                </div>
                <button
                  className="danger"
                  disabled={busy}
                  onClick={() => remove(item.id)}
                  aria-label={`Elimina ${item.name}`}
                >
                  Elimina
                </button>
              </li>
            ))}
          </ul>
          {!listing.documents.length && (
            <p className="muted">Nessun documento. Aggiungi il primo file.</p>
          )}
          <div className="actions">
            <button
              className="secondary"
              disabled={!page || busy}
              onClick={() => {
                setLoading(true);
                setPage(page - 1);
              }}
            >
              Precedenti
            </button>
            <span>Pagina {page + 1}</span>
            <button
              className="secondary"
              disabled={!listing.hasMore || busy}
              onClick={() => {
                setLoading(true);
                setPage(page + 1);
              }}
            >
              Successivi
            </button>
          </div>
        </>
      )}
    </>
  );
}
