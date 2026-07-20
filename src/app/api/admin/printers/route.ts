import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_PRINTERS = ["Berthe", "Philomène", "Ursule", "Godelaine", "Claudine"];

export async function GET() {
  try {
    let printers = await prisma.printer.findMany({
      orderBy: { id: "asc" }
    });

    // If no printers in database, seed them
    if (printers.length === 0) {
      const seedPromises = DEFAULT_PRINTERS.map((name, idx) => {
        // Godelaine defaults to "En veille", others to "Active"
        const defaultStatus = name === "Godelaine" ? "En veille" : "Active";
        return prisma.printer.create({
          data: { name, status: defaultStatus }
        });
      });
      await Promise.all(seedPromises);
      printers = await prisma.printer.findMany({
        orderBy: { id: "asc" }
      });
    }

    return NextResponse.json(printers);
  } catch (error: any) {
    console.error("Error fetching printers:", error.message);
    return NextResponse.json({ error: "Failed to fetch printers" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields id/status" }, { status: 400 });
    }

    const updated = await prisma.printer.update({
      where: { id: Number(id) },
      data: { status }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating printer status:", error.message);
    return NextResponse.json({ error: "Failed to update printer status" }, { status: 500 });
  }
}
