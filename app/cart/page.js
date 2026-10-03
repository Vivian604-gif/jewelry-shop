"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../CartContext";

export default function CartPage() {
  const { items, setQuantity, removeItem, total, loaded } = useCart();

  return (
    <div className="min-h-screen bg-white text-[#2b1428]">
      <header className="border-b border-pink-100">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="font-serif text-2xl tracking-widest text-[#4a1942]">
            LUMIÈRE
          </Link>
          <Link href="/#products" className="text-sm text-[#a5527a] hover:underline">
            Continue shopping
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-serif text-3xl text-[#4a1942]">Your cart</h1>

        {loaded && items.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-pink-200 p-10 text-center">
            <p className="text-[#6b4a63]">Your cart is empty.</p>
            <Link
              href="/#products"
              className="mt-4 inline-block rounded-full bg-[#4a1942] px-6 py-2 text-white"
            >
              Browse jewelry
            </Link>
          </div>
        )}

        {items.length > 0 && (
          <>
            <ul className="mt-8 divide-y divide-pink-100">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-4 py-4">
                  {i.image_url ? (
                    <Image
                      src={i.image_url}
                      alt={i.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 flex-none rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 flex-none rounded-xl bg-gradient-to-br from-[#fbeff4] to-[#e9c1d3] flex items-center justify-center text-2xl">
                      💍
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{i.name}</p>
                    <p className="text-sm text-[#a5527a]">${i.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(i.id, i.quantity - 1)}
                      className="h-8 w-8 rounded-full border border-pink-200"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{i.quantity}</span>
                    <button
                      onClick={() => setQuantity(i.id, i.quantity + 1)}
                      className="h-8 w-8 rounded-full border border-pink-200"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <p className="w-24 text-right font-semibold">
                    ${(i.price * i.quantity).toLocaleString()}
                  </p>
                  <button
                    onClick={() => removeItem(i.id)}
                    className="text-sm text-[#6b4a63] hover:text-red-600"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between border-t border-pink-100 pt-6">
              <span className="text-lg">Total</span>
              <span className="text-2xl font-semibold text-[#4a1942]">
                ${total.toLocaleString()}
              </span>
            </div>

            <Link
              href="/checkout"
              className="mt-6 block rounded-full bg-[#4a1942] py-3 text-center text-white hover:bg-[#6b2a5f]"
            >
              Proceed to checkout
            </Link>
          </>
        )}
      </main>
    </div>
  );
}