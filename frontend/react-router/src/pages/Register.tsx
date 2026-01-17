import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

export const API_BASE =
  import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

// Register page (styled like Login)
export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!res.ok) {
        let msg = "Registration failed";
        try {
          const data = await res.json();
          msg = data?.detail ?? msg;
        } catch {
          const text = await res.text().catch(() => "");
          if (text) msg = text;
        }
        setError(msg);
        return;
      }

      // Successful registration → go to login
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <h2>Register</h2>

      <form className="register-form" onSubmit={submit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <div className="error">{error}</div>}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="info">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
