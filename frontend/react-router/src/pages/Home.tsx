import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/http";
import type { Product } from "../context/CartContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const { addToCart } = useCart();
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api<Product[]>("/products/")
      .then(setProducts)
      .catch((e) => setError(String(e.message ?? e)));
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return products;

    return products.filter((p) => {
      const title = (p.title ?? "").toLowerCase();
      const desc = (p.description ?? "").toLowerCase();
      return title.includes(query) || desc.includes(query);
    });
  }, [products, q]);

  async function deleteAccount() {
    if (!confirm("¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.")) return;
    if (!token) return alert("No estás logueado");

    const res = await fetch(`${API_BASE}/auth/me`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      alert(`No se pudo eliminar la cuenta (${res.status}). ${txt}`);
      return;
    }

    logout();
    navigate("/", { replace: true });
  }

  if (error) return <p style={{ color: "crimson" }}>Error: {error}</p>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* barra superior de la página */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>Productos</h1>

        {token && (
          <button
            onClick={deleteAccount}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid #ef4444",
              background: "#ffffff",
              color: "#ef4444",
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Eliminar mi cuenta
          </button>
        )}
      </div>

      {/* buscador */}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar productos..."
        style={{
          padding: 10,
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          width: "100%",
          maxWidth: 520,
        }}
      />

      {products.length === 0 ? (
        <p>No hay productos aún.</p>
      ) : filtered.length === 0 ? (
        <p>No hay resultados para “{q}”.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.id}`}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 12,
                textDecoration: "none",
                color: "#111827",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{p.title}</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>
                    {p.description ?? "—"}
                  </div>
                </div>

                <div style={{ fontWeight: 700 }}>
                  {(p.price_cents / 100).toFixed(2)} {p.currency}
                </div>
              </div>

              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: 12, color: "#6b7280" }}>Stock: {p.stock}</div>

                <button
                  disabled={p.stock <= 0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(p);
                  }}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "none",
                    background: p.stock > 0 ? "#6b7280" : "#d1d5db",
                    color: "#ffffff",
                    fontSize: 13,
                    cursor: p.stock > 0 ? "pointer" : "not-allowed",
                  }}
                >
                  {p.stock > 0 ? "Añadir" : "Sin stock"}
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
