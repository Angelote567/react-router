import React, { createContext, useContext, useMemo, useState } from "react";

export type Product = {
  id: number;
  title: string;
  description: string | null;
  price_cents: number;
  currency: string;
  stock: number;
  slug: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      addToCart(product) {
        setItems((prev) => {
          const idx = prev.findIndex((x) => x.product.id === product.id);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
            return copy;
          }
          return [...prev, { product, quantity: 1 }];
        });
      },
      removeFromCart(productId) {
        setItems((prev) => prev.filter((x) => x.product.id !== productId));
      },
      setQuantity(productId, quantity) {
        const q = Math.max(1, Math.floor(quantity || 1));
        setItems((prev) =>
          prev.map((x) => (x.product.id === productId ? { ...x, quantity: q } : x))
        );
      },
      clearCart() {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider />");
  return ctx;
}
