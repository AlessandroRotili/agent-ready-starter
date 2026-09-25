"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { jsonRequest, requestJson } from "@/lib/http/client";

export function AuthForm({
  action,
  next = "/account",
}: {
  action: "login" | "signup" | "forgot" | "reset";
  next?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await requestJson(
        "/api/auth",
        jsonRequest("POST", {
          action,
          email: form.get("email"),
          password: form.get("password"),
          next,
        }),
      );
      if (result.redirect) {
        router.push(result.redirect);
        router.refresh();
      } else setMessage(result.message);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Operazione non riuscita.",
      );
    } finally {
      setBusy(false);
    }
  }
  const labels = {
    login: "Accedi",
    signup: "Crea account",
    forgot: "Invia istruzioni",
    reset: "Salva password",
  };
  return (
    <form onSubmit={submit} className="stack">
      {action !== "reset" && (
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </label>
      )}
      {action !== "forgot" && (
        <label>
          Password
          <input
            name="password"
            type="password"
            required
            minLength={action === "login" ? 1 : 12}
            maxLength={128}
            autoComplete={
              action === "login" ? "current-password" : "new-password"
            }
          />
          {action !== "login" && <small>Almeno 12 caratteri.</small>}
        </label>
      )}
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
      <button disabled={busy}>{busy ? "Attendi..." : labels[action]}</button>
    </form>
  );
}
