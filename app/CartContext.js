"use client";
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lumiere-cart");
      if (saved) setItems(JSON.parse(saved));
    } catch (e) {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("lumiere-cart", JSON.stringify(items));
    } catch (e) {}
  }, [items, loaded]);

  const addItem = (product) =>
    setItems((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

  const setQuantity = (id, quantity) =>
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => setItems([]);

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const total = items.reduce((n, i) => n + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, setQuantity, removeItem, clearCart, count, total, loaded }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);