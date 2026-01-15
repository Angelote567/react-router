export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

function getUserEmailForOrders() {
  return localStorage.getItem("orders:user_email") || "";
}

function getToken() {
  return localStorage.getItem("auth:token") || "";
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const email = getUserEmailForOrders();
  const token = getToken();

  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  // Header de pedidos (tu sistema)
  if (email && !headers.has("X-User-Email")) {
    headers.set("X-User-Email", email);
  }

  // ✅ CLAVE: mandar Bearer token si existe
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
