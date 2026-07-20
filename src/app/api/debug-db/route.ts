import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("[Debug DB] Testing Prisma connection...");
    const count = await prisma.order.count();
    return NextResponse.json({
      success: true,
      message: "Database connection successful!",
      ordersCount: count
    });
  } catch (err: any) {
    console.error("[Debug DB Error]", err);
    return NextResponse.json({
      success: false,
      message: "Database connection failed",
      error: err.message || String(err),
      stack: err.stack
    }, { status: 500 });
  }
}
