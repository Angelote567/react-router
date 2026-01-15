export const API_BASE =
  import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

function getUserEmailForOrders() {
  return localStorage.getItem("orders:user_email") || "";
}

function getToken() {
  // ✅ tu AuthContext guarda el token aquí:
  return localStorage.getItem("auth:token") || "";
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const email = getUserEmailForOrders();
  const token = getToken();

  const headers = new Headers(init.headers || {});

  // Content-Type solo si hay body y NO es FormData
  const hasBody = init.body !== undefined && init.body !== null;
  if (hasBody && !headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // ✅ añade Authorization para endpoints protegidos (DELETE/POST admin etc.)
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // (opcional) header legacy que usabas para pedidos
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
