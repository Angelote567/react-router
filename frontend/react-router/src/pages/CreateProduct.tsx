import { useState } from "react";
import "./CreateProduct.css";

type FormState = {
    title: string;
    description: string;
    price: string;
    stock: string;
    slug: string;
    currency: string;
};

export default function CreateProduct() {
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

        const priceNumber = Number(form.price.trim().replace(",", "."));
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
            setLoading(true);
            const res = await fetch("http://127.0.0.1:8000/products/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Error al crear el producto");
            }

            await res.json();
            setSuccess("Producto creado correctamente ✅");
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
            setError("No se pudo crear el producto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-product">
            <h1>Nuevo producto</h1>

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
                        placeholder="Camiseta USJ edición limitada"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Descripción</label>
                    <textarea
                        id="description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Descripción del producto"
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
                        <label htmlFor="slug">Slug (opcional)</label>
                        <input
                            id="slug"
                            name="slug"
                            value={form.slug}
                            onChange={handleChange}
                            placeholder="camiseta-usj-edicion-limitada"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button className="submit-btn" type="submit" disabled={loading}>
                        {loading ? "Guardando..." : "Crear producto"}
                    </button>
                </div>
            </form>
        </div>
    );
}
