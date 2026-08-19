import fs from "fs";
import path from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Fiche } from "./badgeTypes";

const badgesFilePath = path.join(process.cwd(), "src/data/badges.json");

let supabaseBadgesClient: SupabaseClient | null = null;

function getBadgesSupabaseClient(): SupabaseClient | null {
  if (supabaseBadgesClient) return supabaseBadgesClient;

  const url = process.env.BADGES_SUPABASE_URL || "https://jzimmgrwekvlnlrcbymo.supabase.co";
  const key =
    process.env.BADGES_SUPABASE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (!key || key.trim() === "") {
    return null;
  }

  try {
    supabaseBadgesClient = createClient(url, key, {
      auth: { persistSession: false },
    });
    return supabaseBadgesClient;
  } catch (e) {
    console.warn("Failed to create Supabase client for badges:", e);
    return null;
  }
}

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
  const client = getBadgesSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("fiches")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Fiche[];
      }
    } catch (e) {
      console.error("Supabase getBadges error, falling back to local:", e);
    }
  }
  return getLocalBadges();
}

export async function getBadgeByToken(token: string): Promise<Fiche | null> {
  if (!token) return null;
  const cleanToken = token.trim();

  const client = getBadgesSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
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
  }

  const local = getLocalBadges();
  return local.find((b) => b.token.toLowerCase() === cleanToken.toLowerCase()) || null;
}

export async function saveBadgeToDatabase(fiche: Partial<Fiche> & { token: string }): Promise<Fiche | null> {
  let savedFiche: Fiche | null = null;
  const client = getBadgesSupabaseClient();

  if (client) {
    try {
      const { data: existing } = await client
        .from("fiches")
        .select("id, token, data")
        .eq("token", fiche.token)
        .maybeSingle();

      if (existing) {
        const mergedData = {
          ...(existing.data || {}),
          ...(fiche.data || {}),
        };

        const { data: updated, error } = await client
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
          savedFiche = updated as Fiche;
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

        const { data: created, error } = await client
          .from("fiches")
          .insert([newRecord])
          .select()
          .single();

        if (!error && created) {
          savedFiche = created as Fiche;
        }
      }
    } catch (e) {
      console.error("Error saving badge to Supabase:", e);
    }
  }

  // Also update local cache if possible
  try {
    const badges = getLocalBadges();
    const idx = badges.findIndex((b) => b.token.toLowerCase() === fiche.token.toLowerCase());
    if (idx !== -1) {
      badges[idx] = {
        ...badges[idx],
        ...(savedFiche || {
          type: fiche.type || badges[idx].type,
          is_claimed: true,
          data: { ...(badges[idx].data || {}), ...(fiche.data || {}) },
          updated_at: new Date().toISOString(),
        }),
      };
    } else {
      badges.unshift(
        savedFiche || {
          id: `badge-${Date.now()}`,
          token: fiche.token,
          claim_code: fiche.claim_code || null,
          nfc_encoded_at: null,
          password_hash: null,
          type: fiche.type || "festivalier",
          is_claimed: true,
          data: fiche.data || {},
          failed_attempts: 0,
          locked_until: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      );
    }
    saveBadges(badges);
  } catch (e) {
    // Non-critical in read-only environments
  }

  return savedFiche || {
    id: `badge-${Date.now()}`,
    token: fiche.token,
    claim_code: fiche.claim_code || null,
    nfc_encoded_at: null,
    password_hash: null,
    type: fiche.type || "festivalier",
    is_claimed: true,
    data: fiche.data || {},
    failed_attempts: 0,
    locked_until: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function saveBadges(badges: Fiche[]): void {
  try {
    const dir = path.dirname(badgesFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(badgesFilePath, JSON.stringify(badges, null, 2), "utf8");
  } catch (e) {
    // Ignored in read-only serverless filesystems
  }
}
