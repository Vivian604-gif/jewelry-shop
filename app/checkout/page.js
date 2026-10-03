"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useCart } from "../CartContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart, loaded } = useCart();
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      if (u) setForm((f) => ({ ...f, name: f.name || u.user_metadata?.full_name || "" }));
      setAuthReady(true);
    });
  }, []);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const signIn = () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/checkout" },
    });

  const placeOrder = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data } = await supabase.auth.getSession();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + data.session?.access_token,
        },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Something went wrong.");
      setPlaced(true);
      clearCart();
      router.push("/order/" + result.orderId);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const field =
    "w-full rounded-xl border border-pink-200 px-4 py-3 text-sm focus:outline-none focus:border-[#4a1942]";

  return (
    <div className="min-h-screen bg-white text-[#2b1428]">
      <header className="border-b border-pink-100">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="font-serif text-2xl tracking-widest text-[#4a1942]">
            LUMIÈRE
          </Link>
          <Link href="/cart" className="text-sm text-[#a5527a] hover:underline">
            Back to cart
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-serif text-3xl text-[#4a1942]">Checkout</h1>

        {(!authReady || !loaded) && <p className="mt-8 text-[#6b4a63]">Loading…</p>}

        {authReady && loaded && !placed && items.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-pink-200 p-10 text-center">
            <p className="text-[#6b4a63]">Your cart is empty.</p>
            <Link href="/#products" className="mt-4 inline-block rounded-full bg-[#4a1942] px-6 py-2 text-white">
              Browse jewelry
            </Link>
          </div>
        )}

        {authReady && loaded && items.length > 0 && !user && (
          <div className="mt-8 rounded-2xl border border-pink-100 bg-[#fbeff4] p-8 text-center">
            <p className="text-[#4a1942]">Sign in to place your order.</p>
            <button onClick={signIn} className="mt-4 rounded-full bg-[#4a1942] px-6 py-2 text-white">
              Sign in with Google
            </button>
          </div>
        )}

        {authReady && loaded && items.length > 0 && user && (
          <div className="mt-8 grid md:grid-cols-2 gap-10">
            <form onSubmit={placeOrder} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full name</label>
                <input required className={field} value={form.name} onChange={update("name")} />
              </div>
              <div>
                <label className="text-sm font-medium">Delivery address</label>
                <textarea required rows={3} className={field} value={form.address} onChange={update("address")} />
              </div>
              <div>
                <label className="text-sm font-medium">Phone number</label>
                <input className={field} value={form.phone} onChange={update("phone")} />
              </div>
              <p className="text-xs text-[#6b4a63]">
                Confirmation will be sent to {user.email}. Payment is collected on delivery.
              </p>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-[#4a1942] py-3 text-white hover:bg-[#6b2a5f] disabled:opacity-60"
              >
                {submitting ? "Placing order…" : "Place order"}
              </button>
            </form>

            <aside className="rounded-2xl border border-pink-100 p-5 h-fit">
              <h2 className="font-serif text-xl text-[#4a1942]">Order summary</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {items.map((i) => (
                  <li key={i.id} className="flex justify-between gap-3">
                    <span>{i.name} × {i.quantity}</span>
                    <span>${(i.price * i.quantity).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-pink-100 pt-4 font-semibold">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}