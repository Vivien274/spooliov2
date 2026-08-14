import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getTombolaConfigAction,
  updateTombolaStatusAction,
  updateTombolaConfigAction,
  getTombolaTicketsAction,
  reserveTicketAction,
  updateTicketAdminAction,
  quickPhysicalSaleAction,
  drawWinnerAction,
  resetTombolaTicketsAction,
} from "@/app/actions/tombolaActions";

// GET: Fetch tombola details & all 50 tickets
export async function GET() {
  try {
    const [tombola, tickets] = await Promise.all([
      getTombolaConfigAction(),
      getTombolaTicketsAction(),
    ]);

    return NextResponse.json({
      success: true,
      tombola,
      tickets,
      // For backwards compatibility
      reservedTickets: tickets
        .filter((t) => t.status === "reserved" || t.status === "paid")
        .map((t) => t.ticket_number),
    });
  } catch (error: any) {
    console.error("GET /api/tombola error:", error?.message);
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}

// POST: Manage tombola tickets and actions
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // Action: Public Reservation
    if (action === "reserve") {
      const { ticketNumber, buyerName, buyerEmail, buyerPhone } = body;
      const res = await reserveTicketAction({
        ticketNumber: parseInt(ticketNumber, 10),
        buyerName,
        buyerEmail,
        buyerPhone,
      });
      return NextResponse.json(res);
    }

    // Action: Admin Update Ticket
    if (action === "admin_update") {
      const { ticketNumber, status, buyerName, buyerEmail, buyerPhone } = body;
      const res = await updateTicketAdminAction({
        ticketNumber: parseInt(ticketNumber, 10),
        status,
        buyerName,
        buyerEmail,
        buyerPhone,
      });
      return NextResponse.json(res);
    }

    // Action: Quick Physical Sale on Stand
    if (action === "quick_sale") {
      const { ticketNumber, buyerName, buyerPhone } = body;
      const res = await quickPhysicalSaleAction({
        ticketNumber: parseInt(ticketNumber, 10),
        buyerName,
        buyerPhone,
      });
      return NextResponse.json(res);
    }

    // Action: Raffle Draw
    if (action === "draw") {
      const res = await drawWinnerAction();
      return NextResponse.json(res);
    }

    // Action: Reset All Tickets
    if (action === "reset") {
      const res = await resetTombolaTicketsAction();
      return NextResponse.json(res);
    }

    // Legacy Action: toggle_ticket
    if (action === "toggle_ticket") {
      const { ticketNumber } = body;
      const num = parseInt(ticketNumber, 10);
      const tickets = await getTombolaTicketsAction();
      const current = tickets.find((t) => t.ticket_number === num);

      let nextStatus: "available" | "paid" = "paid";
      if (current && (current.status === "paid" || current.status === "reserved")) {
        nextStatus = "available";
      }

      const res = await updateTicketAdminAction({
        ticketNumber: num,
        status: nextStatus,
      });
      return NextResponse.json(res);
    }

    // Action: Update Status (Active / Inactive)
    if (action === "update_status") {
      const { status } = body;
      const res = await updateTombolaStatusAction(status === "active" ? "active" : "inactive");
      return NextResponse.json(res);
    }

    // Action: Update Full Config (Lot details, dates, prices, etc.)
    if (action === "updateConfig" || action === "update_config") {
      const { config } = body;
      const res = await updateTombolaConfigAction(config || body);
      return NextResponse.json(res);
    }

    return NextResponse.json({ success: false, error: "Action inconnue" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/tombola error:", error?.message);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
