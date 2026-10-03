"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function OrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [state, setState] = useState("loading");

  useEffect(() => {
    supabase
      .from("orders")
      .select("*, order_items(quantity, price, products(name))")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setState("missing");
        else {
          setOrder(data);
          setState("ready");
        }
      });
  }, [id]);

  return (
    <div className="min-h-screen bg-white text-[#2b1428]">
      <header className="border-b border-pink-100">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <Link href="/" className="font-serif text-2xl tracking-widest text-[#4a1942]">LUMIÈRE</Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        {state === "loading" && <p className="text-[#6b4a63]">Loading your order…</p>}

        {state === "missing" && (
          <p className="text-[#6b4a63]">
            We could not find this order. Make sure you are signed in with the account that placed it.
          </p>
        )}

        {state === "ready" && order && (
          <>
            <h1 className="font-serif text-3xl text-[#4a1942]">Thank you, {order.name}!</h1>
            <p className="mt-2 text-[#6b4a63]">
              Your order #{order.id} has been placed. A confirmation will be sent to {order.email}.
            </p>

            <ul className="mt-8 divide-y divide-pink-100 rounded-2xl border border-pink-100 px-5">
              {order.order_items.map((it, n) => (
                <li key={n} className="flex justify-between py-3 text-sm">
                  <span>{it.products?.name} × {it.quantity}</span>
                  <span>${(Number(it.price) * it.quantity).toLocaleString()}</span>
                </li>
              ))}
              <li className="flex justify-between py-3 font-semibold">
                <span>Total</span>
                <span>${Number(order.total).toLocaleString()}</span>
              </li>
            </ul>

            <p className="mt-6 text-sm text-[#6b4a63]">Delivering to: {order.address}</p>

            <Link href="/" className="mt-8 inline-block rounded-full bg-[#4a1942] px-6 py-3 text-white">
              Continue shopping
            </Link>
          </>
        )}
      </main>
    </div>
  );
}