"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const CartContext = createContext(null);
const LOCAL_KEY = "lumiere-cart";

const writeLocal = (next) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  } catch (e) {}
};

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Who is signed in?
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = session?.user ?? null;
      setUser((prev) => (prev?.id === next?.id ? prev : next));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Read the signed-in user's cart from the database
  const fetchRemote = useCallback(async (uid) => {
    const { data, error } = await supabase
      .from("cart_items")
      .select("quantity, products(id, name, price, image_url)")
      .eq("user_id", uid)
      .order("id");
    if (error) {
      console.error("Cart load failed:", error.message);
      return;
    }
    setItems(
      (data || [])
        .filter((r) => r.products)
        .map((r) => ({
          id: r.products.id,
          name: r.products.name,
          price: Number(r.products.price),
          image_url: r.products.image_url,
          quantity: r.quantity,
        }))
    );
  }, []);

  // Load the cart and listen for live changes
  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      try {
        const saved = localStorage.getItem(LOCAL_KEY);
        setItems(saved ? JSON.parse(saved) : []);
      } catch (e) {
        setItems([]);
      }
      setLoaded(true);
      return;
    }

    let active = true;
    (async () => {
      // Move any guest cart into the account
      try {
        const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
        if (saved.length) {
          const { data: existing } = await supabase
            .from("cart_items")
            .select("product_id, quantity")
            .eq("user_id", user.id);
          const have = new Map((existing || []).map((r) => [r.product_id, r.quantity]));
          const rows = saved.map((i) => ({
            user_id: user.id,
            product_id: i.id,
            quantity: (have.get(i.id) || 0) + i.quantity,
          }));
          await supabase.from("cart_items").upsert(rows, { onConflict: "user_id,product_id" });
          localStorage.removeItem(LOCAL_KEY);
        }
      } catch (e) {}
      if (!active) return;
      await fetchRemote(user.id);
      if (active) setLoaded(true);
    })();

    const channel = supabase
      .channel("cart-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "cart_items" }, () =>
        fetchRemote(user.id)
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [authReady, user, fetchRemote]);

  const saveRemote = (productId, quantity) =>
    supabase
      .from("cart_items")
      .upsert(
        { user_id: user.id, product_id: productId, quantity },
        { onConflict: "user_id,product_id" }
      );

  const addItem = async (product) => {
    const current = items.find((i) => i.id === product.id);
    const quantity = (current?.quantity || 0) + 1;
    const next = current
      ? items.map((i) => (i.id === product.id ? { ...i, quantity } : i))
      : [...items, { ...product, quantity: 1 }];
    setItems(next);
    if (user) await saveRemote(product.id, quantity);
    else writeLocal(next);
  };

  const removeItem = async (id) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    if (user) await supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", id);
    else writeLocal(next);
  };

  const setQuantity = async (id, quantity) => {
    if (quantity <= 0) return removeItem(id);
    const next = items.map((i) => (i.id === id ? { ...i, quantity } : i));
    setItems(next);
    if (user) await saveRemote(id, quantity);
    else writeLocal(next);
  };

  const clearCart = async () => {
    setItems([]);
    if (user) await supabase.from("cart_items").delete().eq("user_id", user.id);
    else writeLocal([]);
  };

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