import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Server is missing SUPABASE_SERVICE_ROLE_KEY." },
      { status: 500 }
    );
  }

  // Publishable key: used only to check who is logged in
  const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  // Secret key: used only to save the order
  const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. Who is ordering?
  const token = (request.headers.get("authorization") || "").replace("Bearer ", "");
  const { data: userData, error: userError } = await anon.auth.getUser(token);
  if (userError || !userData?.user) {
    console.error("Auth check failed:", userError?.message);
    return NextResponse.json({ error: "Please sign in to place an order." }, { status: 401 });
  }
  const user = userData.user;

  // 2. Check the form
  const { name, address, phone, items } = await request.json();
  if (!name?.trim() || !address?.trim() || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Please fill in your name and address." }, { status: 400 });
  }

  // 3. Use real prices from the database
  const ids = items.map((i) => i.id);
  const { data: products, error: pErr } = await admin
    .from("products")
    .select("id, price")
    .in("id", ids);
  if (pErr || !products?.length) {
    console.error("Price lookup failed:", pErr?.message);
    return NextResponse.json({ error: "Could not check product prices." }, { status: 500 });
  }

  const lines = [];
  let total = 0;
  for (const item of items) {
    const product = products.find((p) => p.id === item.id);
    const quantity = Math.min(Math.max(parseInt(item.quantity, 10) || 1, 1), 20);
    if (!product) continue;
    lines.push({ product_id: product.id, quantity, price: product.price });
    total += Number(product.price) * quantity;
  }
  if (lines.length === 0) {
    return NextResponse.json({ error: "Your cart has no valid items." }, { status: 400 });
  }

  // 4. Save the order
  const { data: order, error: oErr } = await admin
    .from("orders")
    .insert({
      user_id: user.id,
      email: user.email,
      name: name.trim(),
      address: address.trim(),
      phone: (phone || "").trim(),
      total,
    })
    .select()
    .single();
  if (oErr) {
    console.error("Order save failed:", oErr.message);
    return NextResponse.json({ error: "Could not save your order." }, { status: 500 });
  }

  const { error: iErr } = await admin
    .from("order_items")
    .insert(lines.map((l) => ({ ...l, order_id: order.id })));
  if (iErr) {
    console.error("Order items save failed:", iErr.message);
    await admin.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Could not save your order items." }, { status: 500 });
  }

  return NextResponse.json({ orderId: order.id });
}