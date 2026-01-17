import { useState } from "react";
import { api } from "../api/http";
import { useAuth } from "../context/AuthContext";
import "./CreateProduct.css";

type FormState = {
  title: string;
  description: string;
  price: string;
  stock: string;
  slug: string;
  currency: string;
};

// Admin form to create a new product
export default function CreateProduct() {
  const { token } = useAuth();

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    price: "",
    stock: "",
    slug: "",
    currency: "EUR",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

    // Require authentication (admin)
    if (!token) {
      setError("You are not authenticated. Please log in as an admin.");
      return;
    }

    const priceNumber = Number(form.price.trim().replace(",", "."));
    const stockNumber = Number(form.stock);

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    if (isNaN(priceNumber) || priceNumber <= 0) {
      setError("Price must be a number greater than 0.");
      return;
    }

    if (isNaN(stockNumber) || stockNumber < 0) {
      setError("Stock must be a number greater than or equal to 0.");
      return;
    }

    // Generate slug from title if not provided
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
      setLoading(true);

      await api("/products/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      setSuccess("Product created successfully ✅");
      setForm({
        title: "",
        description: "",
        price: "",
        stock: "",
        slug: "",
        currency: "EUR",
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message ? String(err.message) : "The product could not be created.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-product">
      <h1>New Product</h1>

      <form className="create-form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="USJ limited edition T-shirt"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Product description"
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price (€)</label>
            <input
              id="price"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="19.99"
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock</label>
            <input
              id="stock"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="25"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <select id="currency" name="currency" value={form.currency} onChange={handleChange}>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="slug">Slug (optional)</label>
            <input
              id="slug"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="usj-limited-edition-t-shirt"
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create product"}
          </button>
        </div>
      </form>
    </div>
  );
}
