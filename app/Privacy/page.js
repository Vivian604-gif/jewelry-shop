import Link from "next/link";

export const metadata = { title: "Privacy Policy · Lumière Jewelry" };

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white text-[#2b1428]">
      <header className="border-b border-pink-100">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <Link href="/" className="font-serif text-2xl tracking-widest text-[#4a1942]">
            LUMIÈRE
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10 space-y-5 text-[#4a3346]">
        <h1 className="font-serif text-3xl text-[#4a1942]">Privacy Policy</h1>
        <p>Last updated: October 2026. Lumière Jewelry is a demo shop built as a learning project.</p>

        <h2 className="font-serif text-xl text-[#4a1942]">What we collect</h2>
        <p>
          When you sign in with Google we receive your name and email address. When you place an
          order we also store the delivery address, phone number and the items you ordered.
        </p>

        <h2 className="font-serif text-xl text-[#4a1942]">How we use it</h2>
        <p>
          We use this information only to identify your account, process your order and send you an
          order confirmation email. We do not sell your data or use it for advertising.
        </p>

        <h2 className="font-serif text-xl text-[#4a1942]">Where it is stored</h2>
        <p>
          Data is stored in a Supabase database. Confirmation emails are sent through Mailgun.
          Sign-in is provided by Google.
        </p>

        <h2 className="font-serif text-xl text-[#4a1942]">Your choices</h2>
        <p>
          You can ask us to delete your account and order data at any time by emailing
          enemuovivian604@gmail.com.
        </p>
      </main>
    </div>
  );
}