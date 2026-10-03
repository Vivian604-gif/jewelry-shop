const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export async function sendOrderEmail({ to, name, orderId, address, lines, total }) {
  const key = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  if (!key || !domain) {
    console.error("Mailgun is not configured (missing MAILGUN_API_KEY or MAILGUN_DOMAIN).");
    return false;
  }
  const base = process.env.MAILGUN_API_URL || "https://api.mailgun.net";

  const rowsText = lines
    .map((l) => `- ${l.name} x ${l.quantity}: $${(Number(l.price) * l.quantity).toLocaleString()}`)
    .join("\n");

  const text =
    `Hi ${name},\n\nThank you for your order #${orderId} at Lumière Jewelry.\n\n` +
    `${rowsText}\n\nTotal: $${total.toLocaleString()}\n\n` +
    `Delivering to: ${address}\nPayment is collected on delivery.\n\nLumière Jewelry`;

  const rowsHtml = lines
    .map(
      (l) =>
        `<tr><td style="padding:6px 0">${esc(l.name)} × ${l.quantity}</td>` +
        `<td style="padding:6px 0;text-align:right">$${(Number(l.price) * l.quantity).toLocaleString()}</td></tr>`
    )
    .join("");

  const html =
    `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#2b1428">` +
    `<h2 style="color:#4a1942">Thank you, ${esc(name)}!</h2>` +
    `<p>Your order <b>#${orderId}</b> has been placed.</p>` +
    `<table style="width:100%;border-collapse:collapse">${rowsHtml}` +
    `<tr><td style="padding-top:10px;border-top:1px solid #eee"><b>Total</b></td>` +
    `<td style="padding-top:10px;border-top:1px solid #eee;text-align:right"><b>$${total.toLocaleString()}</b></td></tr></table>` +
    `<p>Delivering to: ${esc(address)}</p><p>Payment is collected on delivery.</p>` +
    `<p style="color:#a5527a">Lumière Jewelry</p></div>`;

  const body = new URLSearchParams({
    from: `Lumière Jewelry <postmaster@${domain}>`,
    to,
    subject: `Your Lumière order #${orderId} is confirmed`,
    text,
    html,
  });

  const res = await fetch(`${base}/v3/${domain}/messages`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from("api:" + key).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    console.error("Mailgun failed:", res.status, await res.text());
    return false;
  }
  return true;
}