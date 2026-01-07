import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/http";
import { useCart } from "../context/CartContext";
import type { Product } from "../context/CartContext";

export default function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!productId) return;
    api<Product>(`/products/${productId}`)
      .then(setProduct)
      .catch((e) => setError(String(e.message ?? e)));
  }, [productId]);

  if (error) return <p style={{ color: "crimson" }}>Error: {error}</p>;
  if (!product) return <p>Cargando…</p>;

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <h1 style={{ margin: 0 }}>{product.title}</h1>
      <p style={{ margin: 0, color: "#6b7280" }}>{product.description ?? "—"}</p>
      <p style={{ margin: 0, fontWeight: 700 }}>
        {(product.price_cents / 100).toFixed(2)} {product.currency}
      </p>
      <p style={{ margin: 0, color: "#6b7280" }}>Stock: {product.stock}</p>

      <button
        disabled={product.stock <= 0}
        onClick={() => addToCart(product)}
        style={{
          width: "fit-content",
          border: "1px solid #e5e7eb",
          padding: "8px 12px",
          borderRadius: 12,
          cursor: product.stock > 0 ? "pointer" : "not-allowed",
          background: product.stock > 0 ? "#111827" : "#d1d5db",
          color: "white",
        }}
      >
        {product.stock > 0 ? "Añadir al carrito" : "Sin stock"}
      </button>

    </div>
  );
}
