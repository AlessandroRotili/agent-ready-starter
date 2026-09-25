"use client";
import { useState, type FormEvent } from "react";
import { jsonRequest, requestJson } from "@/lib/http/client";
export function ProfileForm({
  displayName,
  email,
}: {
  displayName: string;
  email: string;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await requestJson(
        "/api/profile",
        jsonRequest("PATCH", { displayName: form.get("displayName") }),
      );
      setMessage("Profilo aggiornato.");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Salvataggio non riuscito.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="stack" onSubmit={submit}>
      <label>
        Nome
        <input
          name="displayName"
          defaultValue={displayName}
          maxLength={100}
          autoComplete="name"
        />
      </label>
      <p className="muted">{email}</p>
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      <button disabled={busy}>Salva profilo</button>
    </form>
  );
}
