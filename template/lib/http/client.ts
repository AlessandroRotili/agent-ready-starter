"use client";
export async function requestJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Operazione non riuscita.");
  return data;
}
export function jsonRequest(method: string, data: unknown): RequestInit {
  return {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  };
}
