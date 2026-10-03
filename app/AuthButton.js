"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthButton() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });

  if (user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="hidden sm:inline text-[#6b4a63]">
          {user.user_metadata?.full_name || user.email}
        </span>
        <button onClick={() => supabase.auth.signOut()} className="hover:text-[#c97b9a]">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button onClick={signIn} className="hover:text-[#c97b9a]">
      Sign in with Google
    </button>
  );
}