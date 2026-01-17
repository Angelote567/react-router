import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/http";
import "./MyOrder.css";

type OrderItem = {
  product_id: number;
  quantity: number;
  unit_price_cents: number;
  title: string;
};

type Order = {
  id: number;
  user_email: string;
  status: string;
  total_cents: number;
  currency: string;
  created_at: string;
  items: OrderItem[];
};

function money(cents: number, currency: string) {
  // Format cents to a currency string
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export default function MyOrder() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);

      if (!isAuthenticated || !user?.email) {
        setError("You are not logged in.");
        setOrders([]);
        return;
      }

      try {
        // Important: if your backend uses X-User-Email,
        // and your api() adds it from localStorage("orders:user_email"),
        // make sure you store that email during login.
        const data = await api<Order[]>("/orders/my", {
          method: "GET",
          // If you want to enforce it here too (in case it's not in localStorage):
          headers: { "X-User-Email": user.email },
        });

        if (!cancelled) setOrders(data);
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message ?? e));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.email]);

  if (error) {
    return (
      <div className="orders">
        <h2>My Orders</h2>
        <p className="error">{error}</p>
      </div>
    );
  }

  if (orders === null) return <div className="orders">Loading…</div>;

  return (
    <div className="orders">
      <h2>My Orders</h2>

      {orders.length === 0 ? (
        <p>You do not have any orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((o) => (
            <div className="order-card" key={o.id}>
              <div className="order-head">
                <div>
                  <div className="order-title">Order #{o.id}</div>
                  <div className="order-sub">
                    {new Date(o.created_at).toLocaleString("es-ES")} · {o.status}
                  </div>
                </div>

                <div className="order-total">{money(o.total_cents, o.currency)}</div>
              </div>

              <div className="order-items">
                {o.items.map((it, idx) => (
                  <div className="order-item" key={`${o.id}-${it.product_id}-${idx}`}>
                    <div className="item-title">{it.title}</div>
                    <div className="item-meta">
                      {it.quantity} × {money(it.unit_price_cents, o.currency)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
