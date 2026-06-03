import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

const CartContext = createContext(null);
const STORAGE_KEY = "eco_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const lineKey = (productId, variationName) => `${productId}::${variationName || "default"}`;

  const addItem = useCallback((product, variation, quantity = 1, isPro = false) => {
    const variationName = variation ? variation.name : null;
    const unit_price = variation
      ? (isPro ? variation.price_professional : variation.price_retail)
      : (isPro ? product.price_professional : product.price_retail);
    const sku = variation ? variation.sku : product.sku;
    setItems((prev) => {
      const key = lineKey(product.id, variationName);
      const existing = prev.find((x) => lineKey(x.product_id, x.variation_name) === key);
      if (existing) {
        return prev.map((x) =>
          lineKey(x.product_id, x.variation_name) === key
            ? { ...x, quantity: x.quantity + quantity }
            : x
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          sku,
          name: product.name,
          variation_name: variationName,
          unit_price,
          quantity,
          image_url: product.image_url || "",
        },
      ];
    });
    toast.success("Añadido al carrito", {
      description: `${product.name}${variation ? " · " + variation.name : ""}`,
    });
    setDrawerOpen(true);
  }, []);

  const updateQuantity = (productId, variationName, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter(
          (x) => !(x.product_id === productId && (x.variation_name || null) === (variationName || null))
        );
      }
      return prev.map((x) =>
        x.product_id === productId && (x.variation_name || null) === (variationName || null)
          ? { ...x, quantity }
          : x
      );
    });
  };

  const removeItem = (productId, variationName) => {
    setItems((prev) =>
      prev.filter(
        (x) => !(x.product_id === productId && (x.variation_name || null) === (variationName || null))
      )
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((acc, it) => acc + it.unit_price * it.quantity, 0);
  const count = items.reduce((acc, it) => acc + it.quantity, 0);

  const value = {
    items,
    subtotal,
    count,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    drawerOpen,
    setDrawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
