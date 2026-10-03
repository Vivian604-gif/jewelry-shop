"use client";
import { useState } from "react";
import { useCart } from "./CartContext";

export default function AddToCartButton({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      onClick={() => {
        addItem(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      className="rounded-full border border-[#4a1942] px-3 py-1 text-xs text-[#4a1942] hover:bg-[#4a1942] hover:text-white"
    >
      {added ? "Added ✓" : "Add"}
    </button>
  );
}