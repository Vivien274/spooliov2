import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { extractBillingAddressFromStripeSession } from "@/lib/stripeAddress";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("spoolio_admin_session")?.value;
  const secret = process.env.JWT_SECRET || "spoolio-ultra-secure-key-928372651";

  if (!token || !(await verifySession(token, secret))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const customerName = searchParams.get("customerName") || undefined;

  if (!sessionId || sessionId.startsWith("sim_") || sessionId.startsWith("manual_")) {
    return NextResponse.json({ billingAddress: null });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim().replace(/[\s\r\n↵\u2195]/g, "");
  if (!stripeKey) {
    return NextResponse.json({ billingAddress: null });
  }

  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${stripeKey}` },
    });
    if (!res.ok) {
      return NextResponse.json({ billingAddress: null });
    }
    const session = await res.json();
    const billingAddress = extractBillingAddressFromStripeSession(session, customerName);
    return NextResponse.json({ billingAddress });
  } catch {
    return NextResponse.json({ billingAddress: null });
  }
}
