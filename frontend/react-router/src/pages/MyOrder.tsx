import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
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
    if (!isAuthenticated || !user?.email) {
      setError("No has iniciado sesión.");
      setOrders([]);
      return;
    }

    fetch("http://127.0.0.1:8000/orders/my", {
      headers: { "X-User-Email": user.email },
    })
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Error cargando pedidos");
        }
        return res.json();
      })
      .then(setOrders)
      .catch((e) => setError(e.message));
  }, [isAuthenticated, user?.email]);

  if (error) {
    return (
      <div className="orders">
        <h2>Mis pedidos</h2>
        <p className="error">{error}</p>
      </div>
    );
  }

  if (orders === null) return <div className="orders">Cargando…</div>;

  return (
    <div className="orders">
      <h2>Mis pedidos</h2>

      {orders.length === 0 ? (
        <p>No tienes pedidos todavía.</p>
      ) : (
        <div className="orders-list">
          {orders.map((o) => (
            <div className="order-card" key={o.id}>
              <div className="order-head">
                <div>
                  <div className="order-title">Pedido #{o.id}</div>
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
