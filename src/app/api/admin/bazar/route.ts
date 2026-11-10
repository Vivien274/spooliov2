import { NextResponse } from "next/server";
import { getBazarDataAction, saveBazarDataAction } from "@/app/actions/bazarActions";
import { BazarDataset } from "@/types/bazar";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dataset = await getBazarDataAction();
    return NextResponse.json(dataset);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const dataset = (await request.json()) as BazarDataset;
    const result = await saveBazarDataAction(dataset);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

