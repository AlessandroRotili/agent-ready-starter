"use client";
import { useState, type FormEvent } from "react";
import { itemInput, type WorkspaceItem } from "@/services/workspace-service";
import { SubmitButton } from "@/components/ui/submit-button";
// Browser-only, disposable state. This is a UX fixture, never an auth mechanism.
export function DemoWorkspace() {
  const [items, setItems] = useState<WorkspaceItem[]>([
    { id: "example", title: "Prima attivita" },
  ]);
  const [error, setError] = useState("");
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const result = itemInput.safeParse({
      title: new FormData(form).get("title"),
    });
    if (!result.success) {
      setError("Inserisci un titolo da 1 a 120 caratteri.");
      return;
    }
    setItems((current) => [
      ...current,
      { id: crypto.randomUUID(), title: result.data.title },
    ]);
    setError("");
    form.reset();
  }
  return (
    <section className="card">
      <h2>Attivita di esempio</h2>
      <form className="stack" onSubmit={add}>
        <label>
          Titolo
          <input name="title" required maxLength={120} />
        </label>
        <SubmitButton pending={false}>Aggiungi</SubmitButton>
        {error && <p role="alert">{error}</p>}
      </form>
      <ul className="file-list">
        {items.map((item) => (
          <li key={item.id}>
            <span>{item.title}</span>
            <button
              onClick={() =>
                setItems((current) => current.filter((x) => x.id !== item.id))
              }
              aria-label={`Elimina ${item.title}`}
            >
              Elimina
            </button>
          </li>
        ))}
      </ul>
      {!items.length && <p>Nessuna attivita.</p>}
    </section>
  );
}
