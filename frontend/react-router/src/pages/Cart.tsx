import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/http";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

// Shopping cart page
export default function Cart() {
  const nav = useNavigate();
  const { items, setQuantity, removeFromCart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Calculate total cart price
  const total = useMemo(() => {
    return items.reduce((sum, it) => sum + it.product.price_cents * it.quantity, 0);
  }, [items]);

  async function validateAndCheckout() {
    setMsg(null);
    setErr(null);

    // Require authentication before checkout
    if (!isAuthenticated || !user?.email) {
      setErr("You must log in to complete the purchase.");
      nav("/login");
      return;
    }

    const payload = {
      items: items.map((it) => ({
        product_id: it.product.id,
        quantity: it.quantity,
      })),
    };

    try {
      // 1) Validate cart
      await api<{ ok: true }>("/checkout/validate", {
        method: "POST",
        headers: { "X-User-Email": user.email },
        body: JSON.stringify(payload),
      });

      // 2) Create order
      const order = await api<{ id: number }>("/orders/", {
        method: "POST",
        headers: { "X-User-Email": user.email },
        body: JSON.stringify(payload),
      });

      clearCart();
      setMsg(`Order created: #${order.id}`);

      // Redirect user to "My Orders"
      nav("/orders");
    } catch (e: any) {
      // Try to parse backend error (usually returned as a JSON string)
      const raw = e?.message ?? String(e);

      try {
        const parsed = JSON.parse(raw);
        const detail = parsed?.detail;

        const first = detail?.errors?.[0];
        if (first?.reason === "OUT_OF_STOCK") {
          setErr(
            `Not enough stock to complete the purchase. Available: ${first.stock}, requested: ${first.requested}.`
          );
          return;
        }

        // Fallback when detail is a string
        if (typeof detail === "string") {
          setErr(detail);
          return;
        }
      } catch {
        // If not JSON, fall back to generic error
      }

      setErr("The cart could not be validated. Please check quantities and try again.");
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>Cart</h1>

      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div style={{ display: "grid", gap: 10 }}>
            {items.map((it) => (
              <div
                key={it.product.id}
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
                  <div style={{ fontWeight: 700 }}>{it.product.title}</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>
                    {(it.product.price_cents / 100).toFixed(2)} {it.product.currency}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="number"
                    min={1}
                    value={it.quantity}
                    onChange={(e) => setQuantity(it.product.id, Number(e.target.value))}
                    style={{ width: 70, padding: 6, borderRadius: 10, border: "1px solid #e5e7eb" }}
                  />
                  <button
                    onClick={() => removeFromCart(it.product.id)}
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "6px 10px",
                      borderRadius: 10,
                      cursor: "pointer",
                      background: "white",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 800 }}>
              Total: {(total / 100).toFixed(2)}
            </div>
            <button
              onClick={validateAndCheckout}
              style={{
                border: "1px solid #111827",
                padding: "8px 12px",
                borderRadius: 12,
                cursor: "pointer",
                background: "#111827",
                color: "white",
              }}
            >
              Validate and purchase
            </button>
          </div>

          {msg && <p style={{ color: "green", margin: 0 }}>{msg}</p>}
          {err && <p style={{ color: "crimson", margin: 0 }}>Error: {err}</p>}
        </>
      )}
    </div>
  );
}
