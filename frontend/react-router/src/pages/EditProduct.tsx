import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/http";
import { useAuth } from "../context/AuthContext";
import "./CreateProduct.css";

type FormState = {
  title: string;
  description: string;
  price: string; // en euros
  stock: string;
  slug: string;
  currency: string;
};

type ProductApi = {
  id: number;
  title: string;
  description?: string | null;
  price_cents: number;
  currency: string;
  stock: number;
  slug?: string | null;
};

export default function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    price: "",
    stock: "",
    slug: "",
    currency: "EUR",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setError(null);

      if (!productId) {
        setError("Producto inválido.");
        setLoading(false);
        return;
      }

      try {
        const data = await api<ProductApi>(`/products/${productId}`, {
          method: "GET",
          // Si tu backend requiere admin incluso para leer, descomenta:
          // headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (cancelled) return;

        setForm({
          title: data.title ?? "",
          description: data.description ?? "",
          price: ((data.price_cents ?? 0) / 100).toFixed(2),
          stock: String(data.stock ?? 0),
          slug: data.slug ?? "",
          currency: data.currency ?? "EUR",
        });
      } catch (err: any) {
        console.error(err);
        if (!cancelled) setError(err?.message ? String(err.message) : "No se pudo cargar el producto.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!productId) {
      setError("Producto inválido.");
      return;
    }

    if (!token) {
      setError("No estás autenticado. Inicia sesión como admin.");
      return;
    }

    const priceNumber = Number(form.price.replace(",", "."));
    const stockNumber = Number(form.stock);

    if (!form.title.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    if (isNaN(priceNumber) || priceNumber <= 0) {
      setError("El precio debe ser un número mayor que 0.");
      return;
    }

    if (isNaN(stockNumber) || stockNumber < 0) {
      setError("El stock debe ser un número mayor o igual que 0.");
      return;
    }

    const slug =
      form.slug.trim() ||
      form.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const body = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      price_cents: Math.round(priceNumber * 100),
      currency: form.currency,
      stock: stockNumber,
      slug,
    };

    try {
      setSaving(true);

      await api(`/products/${productId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      setSuccess("Producto actualizado correctamente ✅");
      setTimeout(() => navigate("/admin/products"), 800);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ? String(err.message) : "No se pudo actualizar el producto.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>Cargando producto...</p>;
  }

  return (
    <div className="create-product">
      <h1>Editar producto</h1>

      <form className="create-form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <div className="form-group">
          <label htmlFor="title">Título</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Precio (€)</label>
            <input id="price" name="price" value={form.price} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock</label>
            <input id="stock" name="stock" value={form.stock} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="currency">Moneda</label>
            <select id="currency" name="currency" value={form.currency} onChange={handleChange}>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="slug">Slug</label>
            <input id="slug" name="slug" value={form.slug} onChange={handleChange} />
          </div>
        </div>

        <div className="form-actions">
          <button className="submit-btn" type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-secondary"
          style={{ marginBottom: "1rem" }}
        >
          Volver
        </button>
      </form>
    </div>
  );
}
