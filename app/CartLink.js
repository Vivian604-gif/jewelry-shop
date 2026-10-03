"use client";
import Link from "next/link";
import { useCart } from "./CartContext";

export default function CartLink() {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      className="rounded-full bg-[#4a1942] px-4 py-2 text-white hover:bg-[#6b2a5f]"
    >
      Cart ({count})
    </Link>
  );
}