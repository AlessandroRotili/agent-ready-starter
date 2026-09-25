"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { jsonRequest, requestJson } from "@/lib/http/client";
export function Logout() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <button
        className="secondary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await requestJson(
              "/api/auth",
              jsonRequest("POST", { action: "logout" }),
            );
            router.replace("/login");
            router.refresh();
          } catch {
            setError("Uscita non riuscita. Riprova.");
          } finally {
            setBusy(false);
          }
        }}
      >
        Esci
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
