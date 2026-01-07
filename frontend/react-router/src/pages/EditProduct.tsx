import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CreateProduct.css";

type FormState = {
    title: string;
    description: string;
    price: string; // en euros
    stock: string;
    slug: string;
    currency: string;
};

export default function EditProduct() {
    const { productId } = useParams();
    const navigate = useNavigate();
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
        async function loadProduct() {
            try {
                const res = await fetch(
                    `http://127.0.0.1:8000/products/${productId}`
                );
                const data = await res.json();

                setForm({
                    title: data.title ?? "",
                    description: data.description ?? "",
                    price: (data.price_cents / 100).toFixed(2),
                    stock: String(data.stock ?? 0),
                    slug: data.slug ?? "",
                    currency: data.currency ?? "EUR",
                });
            } catch (err) {
                console.error(err);
                setError("No se pudo cargar el producto.");
            } finally {
                setLoading(false);
            }
        }

        loadProduct();
    }, [productId]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

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
            const res = await fetch(
                `http://127.0.0.1:8000/products/${productId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                }
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Error al actualizar el producto");
            }

            setSuccess("Producto actualizado correctamente ✅");
            // Opcional: volver al listado admin
            setTimeout(() => navigate("/admin/products"), 800);
        } catch (err) {
            console.error(err);
            setError("No se pudo actualizar el producto.");
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
                    <input
                        id="title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                    />
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
                        <input
                            id="price"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="stock">Stock</label>
                        <input
                            id="stock"
                            name="stock"
                            value={form.stock}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="currency">Moneda</label>
                        <select
                            id="currency"
                            name="currency"
                            value={form.currency}
                            onChange={handleChange}
                        >
                            <option value="EUR">EUR</option>
                            <option value="USD">USD</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="slug">Slug</label>
                        <input
                            id="slug"
                            name="slug"
                            value={form.slug}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button className="submit-btn" type="submit" disabled={saving}>
                        {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                </div>
                <button
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
