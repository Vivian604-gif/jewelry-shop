import { supabase } from "../lib/supabase";
import CartLink from "./CartLink";
import AddToCartButton from "./AddToCartButton";
export const revalidate = 60;

const categories = [
  { name: "Necklaces", icon: "📿" },
  { name: "Earrings", icon: "✨" },
  { name: "Rings", icon: "💍" },
  { name: "Bracelets", icon: "🔗" },
  { name: "Pendants", icon: "💎" },
];

const perks = [
  { title: "Certified Jewelry", text: "Authentic and hallmarked" },
  { title: "Easy Returns", text: "15 days, no questions asked" },
  { title: "Lifetime Exchange", text: "Upgrade your piece anytime" },
  { title: "Customer Support", text: "We are here to help" },
];

export default async function Home() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("id");

  return (
    <div className="bg-white text-[#2b1428]">
      {/* Announcement bar */}
      <div className="bg-[#4a1942] text-center text-xs text-pink-100 py-2 px-4">
        Free shipping on orders over $100 · Certified hallmarked jewelry
      </div>

      {/* Header */}
      <header className="border-b border-pink-100">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <a href="/" className="font-serif text-2xl tracking-widest text-[#4a1942]">
            LUMIÈRE
            <span className="block text-[10px] tracking-[0.4em] text-[#c97b9a]">JEWELRY</span>
          </a>
          <nav className="hidden md:flex gap-7 text-sm">
            <a href="#" className="hover:text-[#c97b9a]">Home</a>
            <a href="#categories" className="hover:text-[#c97b9a]">Collections</a>
            <a href="#products" className="hover:text-[#c97b9a]">Shop</a>
            <a href="#" className="hover:text-[#c97b9a]">About</a>
          </nav>
          <div className="flex items-center gap-4 text-sm">
            <button className="hover:text-[#c97b9a]">Sign in</button>
            <CartLink />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#fbeff4] via-[#f6e0ea] to-[#ecc9da]">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 items-center gap-10 px-6 py-16 md:py-24">
          <div>
            <p className="text-sm text-[#a5527a]">Crafted to celebrate you</p>
            <h1 className="mt-3 font-serif text-4xl md:text-6xl leading-tight text-[#4a1942]">
              Shine that tells <br /> your story.
            </h1>
            <p className="mt-5 max-w-md text-[#6b4a63]">
              Rings, necklaces and earrings made to be worn every day and remembered for
              a lifetime.
            </p>
            <a
              href="#products"
              className="mt-8 inline-block rounded-full bg-[#4a1942] px-7 py-3 text-white hover:bg-[#6b2a5f]"
            >
              Explore collections
            </a>
          </div>
          <div className="aspect-[4/3] rounded-3xl bg-gradient-to-tr from-[#d9a0bb] to-[#fbeff4] flex items-center justify-center text-8xl shadow-xl">
            💎
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="font-serif text-2xl text-[#4a1942]">Find your perfect piece</h2>
        <div className="mt-8 flex flex-wrap justify-between gap-6">
          {categories.map((c) => (
            <a key={c.name} href="#products" className="group text-center">
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-full bg-gradient-to-br from-[#f6e0ea] to-[#d9a0bb] flex items-center justify-center text-4xl group-hover:scale-105 transition">
                {c.icon}
              </div>
              <p className="mt-3 text-sm font-medium">{c.name}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Products */}
      <section id="products" className="mx-auto max-w-6xl px-6 pb-16">
        <p className="text-xs text-[#a5527a]">Our bestsellers</p>
        <h2 className="font-serif text-2xl text-[#4a1942]">Handpicked for you</h2>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-5">
          {error && (
            <p className="col-span-full text-sm text-red-600">Could not load products.</p>
          )}
          {(products || []).map((p) => (
            <div key={p.id} className="rounded-2xl border border-pink-100 p-3">
              <div className="aspect-square rounded-xl bg-gradient-to-br from-[#fbeff4] to-[#e9c1d3] flex items-center justify-center text-5xl">
                💍
              </div>
              <h3 className="mt-3 text-sm font-medium">{p.name}</h3>
              <p className="text-[#a5527a] text-xs">★★★★★</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-semibold">${Number(p.price).toLocaleString()}</span>
                <AddToCartButton product={{ id: p.id, name: p.name, price: Number(p.price) }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-[#4a1942] text-pink-100">
        <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-6 px-6 py-10">
          {perks.map((k) => (
            <div key={k.title}>
              <p className="font-medium text-white">{k.title}</p>
              <p className="text-sm text-pink-200">{k.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter + footer */}
      <footer className="bg-[#f6e9ef]">
        <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h3 className="font-serif text-xl text-[#4a1942]">Stay connected</h3>
            <p className="text-sm text-[#6b4a63]">Get new arrivals and special offers by email.</p>
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="rounded-full border border-pink-200 bg-white px-4 py-2 text-sm w-60"
            />
            <button className="rounded-full bg-[#4a1942] px-5 py-2 text-sm text-white">Subscribe</button>
          </div>
        </div>
        <p className="text-center text-xs text-[#6b4a63] pb-6">© 2026 Lumière Jewelry</p>
      </footer>
    </div>
  );
}