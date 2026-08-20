import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DATA_FILE = path.join(process.cwd(), "src", "data", "poll_boardgames.json");
const DB_SLUG = "config-poll-boardgames";

interface PollData {
  1: number;
  2: number;
  3: number;
  4: number;
  totalVotes: number;
  lastUpdated: string;
}

const DEFAULT_POLL: PollData = {
  1: 0, // Dés qui tombent
  2: 0, // Feuilles de score
  3: 0, // Cartes en main
  4: 0, // Paris & historique
  totalVotes: 0,
  lastUpdated: new Date().toISOString(),
};

async function readPollData(): Promise<PollData> {
  // 1. Try reading from Prisma Database first
  try {
    const page = await prisma.page.findUnique({
      where: { slug: DB_SLUG },
    });
    if (page && page.content) {
      const parsed = JSON.parse(page.content);
      if (parsed && typeof parsed === "object") {
        return { ...DEFAULT_POLL, ...parsed };
      }
    }
  } catch (dbErr: any) {
    console.warn("Prisma query for poll_boardgames failed/fallback:", dbErr?.message);
  }

  // 2. Fallback to local file
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return { ...DEFAULT_POLL, ...JSON.parse(content) };
    }
  } catch (e) {
    console.error("Error reading poll_boardgames.json:", e);
  }
  return DEFAULT_POLL;
}

async function writePollData(data: PollData) {
  const jsonStr = JSON.stringify(data, null, 2);

  // 1. Save to Prisma Database
  try {
    await prisma.page.upsert({
      where: { slug: DB_SLUG },
      update: { content: jsonStr },
      create: {
        title: "Sondage Jeux de Société",
        slug: DB_SLUG,
        content: jsonStr,
        status: "publish",
      },
    });
  } catch (dbErr: any) {
    console.error("Failed saving poll data to Prisma DB:", dbErr?.message);
  }

  // 2. Save to local disk if writable
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, jsonStr, "utf-8");
  } catch (e: any) {
    console.log("Local disk save bypassed (serverless environment):", e?.message);
  }
}

export async function GET() {
  const poll = await readPollData();
  return NextResponse.json(poll);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Support explicit reset action
    if (body.action === "reset") {
      const resetData: PollData = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        totalVotes: 0,
        lastUpdated: new Date().toISOString(),
      };
      await writePollData(resetData);
      return NextResponse.json({
        success: true,
        message: "Sondage réinitialisé à zéro avec succès !",
        data: resetData,
      });
    }

    const { optionId } = body;
    const numericOption = parseInt(optionId, 10);

    if (!numericOption || ![1, 2, 3, 4].includes(numericOption)) {
      return NextResponse.json({ error: "Option de vote invalide" }, { status: 400 });
    }

    const currentData = await readPollData();
    const optionKey = numericOption as 1 | 2 | 3 | 4;

    currentData[optionKey] = (currentData[optionKey] || 0) + 1;
    currentData.totalVotes = (currentData.totalVotes || 0) + 1;
    currentData.lastUpdated = new Date().toISOString();

    await writePollData(currentData);

    return NextResponse.json({
      success: true,
      message: "Vote enregistré avec succès !",
      data: currentData,
    });
  } catch (error) {
    console.error("Error handling poll vote:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
