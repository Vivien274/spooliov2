import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const DATA_FILE = path.join(process.cwd(), "src", "data", "poll_boardgames.json");

interface PollData {
  1: number;
  2: number;
  3: number;
  4: number;
  totalVotes: number;
  lastUpdated: string;
}

const DEFAULT_POLL: PollData = {
  1: 142, // Dés qui tombent
  2: 189, // Feuilles de score
  3: 98,  // Cartes en main
  4: 124, // Paris & historique
  totalVotes: 553,
  lastUpdated: new Date().toISOString(),
};

function readPollData(): PollData {
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

function writePollData(data: PollData) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing poll_boardgames.json:", e);
  }
}

export async function GET() {
  const poll = readPollData();
  return NextResponse.json(poll);
}

export async function POST(req: Request) {
  try {
    const { optionId } = await req.json();
    const numericOption = parseInt(optionId, 10);

    if (!numericOption || ![1, 2, 3, 4].includes(numericOption)) {
      return NextResponse.json({ error: "Option de vote invalide" }, { status: 400 });
    }

    const currentData = readPollData();
    const optionKey = numericOption as 1 | 2 | 3 | 4;

    currentData[optionKey] = (currentData[optionKey] || 0) + 1;
    currentData.totalVotes = (currentData.totalVotes || 0) + 1;
    currentData.lastUpdated = new Date().toISOString();

    writePollData(currentData);

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
