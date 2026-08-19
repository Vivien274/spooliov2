import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { Fiche } from "./badgeTypes";

const BADGES_SUPABASE_URL = process.env.BADGES_SUPABASE_URL || "https://jzimmgrwekvlnlrcbymo.supabase.co";
const BADGES_SUPABASE_KEY = process.env.BADGES_SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseBadges = createClient(BADGES_SUPABASE_URL, BADGES_SUPABASE_KEY);
const badgesFilePath = path.join(process.cwd(), "src/data/badges.json");

function getLocalBadges(): Fiche[] {
  try {
    if (fs.existsSync(badgesFilePath)) {
      return JSON.parse(fs.readFileSync(badgesFilePath, "utf8"));
    }
  } catch (e) {
    console.error("Error reading local badges.json:", e);
  }
  return [];
}

export async function getBadges(): Promise<Fiche[]> {
  try {
    const { data, error } = await supabaseBadges
      .from("fiches")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as Fiche[];
    }
  } catch (e) {
    console.error("Supabase getBadges error, falling back to local:", e);
  }
  return getLocalBadges();
}

export async function getBadgeByToken(token: string): Promise<Fiche | null> {
  if (!token) return null;
  const cleanToken = token.trim();

  try {
    const { data, error } = await supabaseBadges
      .from("fiches")
      .select("*")
      .eq("token", cleanToken)
      .maybeSingle();

    if (!error && data) {
      return data as Fiche;
    }
  } catch (e) {
    console.error("Supabase getBadgeByToken error, falling back to local:", e);
  }

  const local = getLocalBadges();
  return local.find((b) => b.token.toLowerCase() === cleanToken.toLowerCase()) || null;
}

export async function saveBadgeToDatabase(fiche: Partial<Fiche> & { token: string }): Promise<Fiche | null> {
  try {
    const { data: existing } = await supabaseBadges
      .from("fiches")
      .select("id, token, data")
      .eq("token", fiche.token)
      .maybeSingle();

    if (existing) {
      const mergedData = {
        ...(existing.data || {}),
        ...(fiche.data || {}),
      };

      const { data: updated, error } = await supabaseBadges
        .from("fiches")
        .update({
          type: fiche.type || "festivalier",
          is_claimed: true,
          data: mergedData,
          updated_at: new Date().toISOString(),
        })
        .eq("token", fiche.token)
        .select()
        .single();

      if (!error && updated) {
        return updated as Fiche;
      }
    } else {
      const newRecord = {
        token: fiche.token,
        claim_code: fiche.claim_code || null,
        password_hash: fiche.password_hash || null,
        type: fiche.type || "festivalier",
        is_claimed: true,
        data: fiche.data || {},
        failed_attempts: 0,
        locked_until: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: created, error } = await supabaseBadges
        .from("fiches")
        .insert([newRecord])
        .select()
        .single();

      if (!error && created) {
        return created as Fiche;
      }
    }
  } catch (e) {
    console.error("Error saving badge to Supabase:", e);
  }
  return null;
}

export function saveBadges(badges: Fiche[]): void {
  try {
    const dir = path.dirname(badgesFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(badgesFilePath, JSON.stringify(badges, null, 2), "utf8");
  } catch (e) {
    console.error("Error saving badges.json:", e);
  }
}
