export function extractAddressFromStripeSession(
  session: any,
  customerName?: string,
  shippingMethod?: string
): string | null {
  if (!session) return null;

  // 1. Point Relais address from metadata
  if (shippingMethod === "relay" && session.metadata?.relay_address) {
    return [
      session.shipping_details?.name || session.customer_details?.name || customerName,
      session.metadata?.relay_name || "Point Relais",
      session.metadata.relay_address
    ].filter(Boolean).join("\n");
  }

  // 2. Extract from shipping_details, customer_details or collected_information
  const shipObj = session.shipping_details || session.collected_information?.shipping_details || session.shipping;
  const custObj = session.customer_details;

  const addr = shipObj?.address || custObj?.address;
  const name = shipObj?.name || custObj?.name || customerName;

  if (addr && (addr.line1 || addr.city || addr.postal_code)) {
    const line1 = addr.line1 || "";
    const line2 = addr.line2 || "";
    const zipCity = [addr.postal_code || "", addr.city || ""].filter(Boolean).join(" ");
    const state = addr.state || "";
    const countryCode = addr.country || "FR";
    const countryName = countryCode === "FR" ? "France" : (countryCode === "BE" ? "Belgique" : countryCode);

    return [
      name,
      line1,
      line2,
      zipCity,
      state,
      countryName
    ].filter(Boolean).join("\n");
  }

  return null;
}

export async function fetchStripeSessionAddress(
  stripeSessionId: string,
  customerName?: string,
  shippingMethod?: string
): Promise<string | null> {
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim().replace(/[\s\r\n↵\u2195]/g, "");
  if (!stripeKey || !stripeSessionId) return null;

  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${stripeSessionId}`, {
      headers: { Authorization: `Bearer ${stripeKey}` }
    });

    if (res.ok) {
      const session = await res.json();
      return extractAddressFromStripeSession(session, customerName, shippingMethod);
    }
  } catch (e: any) {
    console.error(`[Stripe Address Error] Failed to fetch session ${stripeSessionId}:`, e?.message);
  }

  return null;
}
