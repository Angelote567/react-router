import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export const API_BASE =
  import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

export default function Register() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        // FastAPI suele devolver { detail: ... }
        let msg = "No se pudo registrar";
        try {
          const data = await res.json();
          msg = data?.detail ?? msg;
        } catch {
          const text = await res.text().catch(() => "");
          if (text) msg = text;
        }
        setErr(msg);
        return;
      }

      // Registro OK -> a login
      nav("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1 style={{ marginTop: 0 }}>Registro</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }}
          type="email"
          required
        />

        <input
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }}
          type="password"
          required
        />

        {err && <div style={{ color: "crimson" }}>{err}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear cuenta"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}
