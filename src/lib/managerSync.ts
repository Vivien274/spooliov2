import { parseItemName } from "./orderUtils";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://twjqfwigssfkiwjvhpjy.supabase.co";

function getSupabaseKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
}

function extractColorFromOptions(optionsText: string): string | null {
  if (!optionsText) return null;
  const match = optionsText.match(/couleur\s*:\s*([^,)]+)/i) || optionsText.match(/color\s*:\s*([^,)]+)/i);
  return match ? match[1].trim() : null;
}

export async function syncOrderToManager(order: {
  id: string;
  email: string;
  customerName?: string | null;
  items: string | any[];
  total: number;
  shippingMethod?: string;
  createdAt?: string | Date;
}): Promise<boolean> {
  try {
    const apiKey = getSupabaseKey();
    if (!apiKey) {
      console.warn("[Manager Sync] Missing Supabase API key. Skipping sync.");
      return false;
    }

    const headers = {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    };

    const externalId = `sp_${order.id}`;

    // 1. Check if order is already synced in client_orders
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/client_orders?external_id=eq.${encodeURIComponent(externalId)}&select=id`,
      { headers }
    );

    if (checkRes.ok) {
      const existing = await checkRes.json();
      if (Array.isArray(existing) && existing.length > 0) {
        console.log(`[Manager Sync] Order ${order.id} is already present in spoolio-manager.`);
        return true;
      }
    }

    // 2. Retrieve owner user_id from user_profiles if available
    let ownerId: string | null = null;
    try {
      const ownerRes = await fetch(
        `${SUPABASE_URL}/rest/v1/user_profiles?role=eq.owner&select=user_id&limit=1`,
        { headers }
      );
      if (ownerRes.ok) {
        const ownerData = await ownerRes.json();
        if (Array.isArray(ownerData) && ownerData.length > 0) {
          ownerId = ownerData[0].user_id;
        }
      }
    } catch (e) {
      // Non-critical
    }

    const clientName = order.customerName && order.customerName.trim()
      ? order.customerName.trim()
      : order.email;

    const parsedItems = typeof order.items === "string"
      ? JSON.parse(order.items || "[]")
      : (order.items || []);

    const orderDate = order.createdAt
      ? new Date(order.createdAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    // 3. Insert order into client_orders
    const insertOrderRes = await fetch(`${SUPABASE_URL}/rest/v1/client_orders`, {
      method: "POST",
      headers,
      body: JSON.stringify([{
        client_id: ownerId,
        client_name: clientName,
        client_type: "b2c",
        source: "spooliov2",
        external_id: externalId,
        status: "reçue",
        amount_paid: order.total || 0,
        notes: `Commande SpoolioV2 #${order.id} (${order.shippingMethod || "standard"})`,
        order_date: orderDate
      }])
    });

    if (!insertOrderRes.ok) {
      const errText = await insertOrderRes.text();
      console.error(`[Manager Sync] Failed to insert client_order for ${order.id}:`, errText);
      return false;
    }

    const insertedOrders = await insertOrderRes.json();
    const newOrderId = insertedOrders[0]?.id;

    if (!newOrderId) {
      console.error("[Manager Sync] Insert returned no client_order ID.");
      return false;
    }

    // 4. Insert order items into client_order_items
    const itemInserts = parsedItems.map((item: any) => {
      const { mainName, options } = parseItemName(item.name || "");
      const optionsStr = options.join(", ");
      const color = extractColorFromOptions(optionsStr);

      return {
        order_id: newOrderId,
        product_id: null,
        product_name: mainName,
        quantity: item.quantity || 1,
        unit_price: item.price ? parseFloat(String(item.price)) : 0,
        color: color,
        qty_delivered: 0,
        qty_printing: 0,
        qty_printing_lid: 0,
        qty_refill: 0,
        has_refill: false,
        production_status: "todo"
      };
    });

    if (itemInserts.length > 0) {
      const insertItemsRes = await fetch(`${SUPABASE_URL}/rest/v1/client_order_items`, {
        method: "POST",
        headers,
        body: JSON.stringify(itemInserts)
      });

      if (!insertItemsRes.ok) {
        const itemErrText = await insertItemsRes.text();
        console.error(`[Manager Sync] Failed to insert items for ${order.id}:`, itemErrText);
      }
    }

    console.log(`✅ [Manager Sync] Order ${order.id} successfully synced to spoolio-manager Supabase!`);
    return true;
  } catch (e: any) {
    console.error(`[Manager Sync Error] Exception while syncing order ${order.id}:`, e.message || e);
    return false;
  }
}
