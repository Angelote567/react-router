import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, API_BASE } from "../api/http";
import type { Product } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const { token } = useAuth();

  async function load() {
    setErr(null);
    try {
      const data = await api<Product[]>("/products/");
      setProducts(data);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  useEffect(() => {
    load();
  }, []);
  
async function remove(id: number) {
  if (!confirm("¿Eliminar producto?")) return;

  try {
    if (!token) throw new Error("No hay token. Inicia sesión otra vez.");

    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }

    await load();
  } catch (e: any) {
    setErr(e?.message ?? String(e));
  }
}

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Admin: productos</h1>
        <Link
          to="/admin/products/new"
          style={{
            border: "1px solid #111827",
            padding: "8px 12px",
            borderRadius: 12,
            textDecoration: "none",
            background: "#111827",
            color: "white",
          }}
        >
          + Nuevo
        </Link>
      </div>

      {err && <p style={{ color: "crimson", margin: 0 }}>Error: {err}</p>}

      {products.length === 0 ? (
        <p>No hay productos.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 12,
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 800 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  {(p.price_cents / 100).toFixed(2)} {p.currency} · stock {p.stock}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <Link
                  to={`/admin/products/${p.id}/edit`}
                  style={{
                    border: "1px solid #e5e7eb",
                    padding: "6px 10px",
                    borderRadius: 10,
                    textDecoration: "none",
                    color: "#111827",
                    background: "white",
                  }}
                >
                  Editar
                </Link>
                <button
                  onClick={() => remove(p.id)}
                  style={{
                    border: "1px solid #e5e7eb",
                    padding: "6px 10px",
                    borderRadius: 10,
                    cursor: "pointer",
                    background: "white",
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
