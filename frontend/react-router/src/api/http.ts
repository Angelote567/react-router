export const API_BASE =
  import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

function getUserEmailForOrders() {
  // lo guardas en AuthContext (orders:user_email)
  return localStorage.getItem("orders:user_email") || "";
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const email = getUserEmailForOrders();

  // merge headers correctamente SIN perder los de init
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  // añade el header solo si hay email (y si no lo han puesto ya)
  if (email && !headers.has("X-User-Email")) {
    headers.set("X-User-Email", email);
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
