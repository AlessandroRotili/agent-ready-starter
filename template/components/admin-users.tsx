"use client";
import { useEffect, useState } from "react";
import { requestJson } from "@/lib/http/client";
type User = { id: string; display_name: string; created_at: string };
export function AdminUsers() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<{ users: User[]; hasMore: boolean } | null>(
    null,
  );
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    requestJson(`/api/admin/users?page=${page}`, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setData(data);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      });
    return () => controller.abort();
  }, [page]);
  return (
    <>
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      {!data ? (
        !error && <p role="status">Caricamento...</p>
      ) : (
        <>
          <ul className="file-list">
            {data.users.map((user) => (
              <li key={user.id}>
                <div>
                  {user.display_name || "Nome non impostato"}
                  <small>{user.id}</small>
                </div>
                <time dateTime={user.created_at}>
                  {new Date(user.created_at).toLocaleDateString("it-IT")}
                </time>
              </li>
            ))}
          </ul>
          <div className="actions">
            <button
              disabled={!page}
              onClick={() => {
                setData(null);
                setError("");
                setPage(page - 1);
              }}
            >
              Precedenti
            </button>
            <span>Pagina {page + 1}</span>
            <button
              disabled={!data.hasMore}
              onClick={() => {
                setData(null);
                setError("");
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
