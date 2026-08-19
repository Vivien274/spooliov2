import { prisma } from "@/lib/prisma";
import { Fiche, FicheType } from "./badgeTypes";
import fs from "fs";
import path from "path";

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

function mapPrismaToFiche(b: any): Fiche {
  return {
    id: b.id,
    token: b.token,
    claim_code: b.claimCode,
    nfc_encoded_at: b.nfcEncodedAt ? (b.nfcEncodedAt instanceof Date ? b.nfcEncodedAt.toISOString() : b.nfcEncodedAt) : null,
    password_hash: b.passwordHash,
    type: (b.type as FicheType) || "festivalier",
    is_claimed: b.isClaimed,
    data: (b.data as any) || {},
    failed_attempts: b.failedAttempts,
    locked_until: b.lockedUntil ? (b.lockedUntil instanceof Date ? b.lockedUntil.toISOString() : b.lockedUntil) : null,
    created_at: b.createdAt ? (b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt) : new Date().toISOString(),
    updated_at: b.updatedAt ? (b.updatedAt instanceof Date ? b.updatedAt.toISOString() : b.updatedAt) : new Date().toISOString(),
  };
}

export async function getBadges(): Promise<Fiche[]> {
  try {
    if (prisma?.badge) {
      const records = await prisma.badge.findMany({
        orderBy: { createdAt: "desc" },
      });
      if (records && records.length > 0) {
        return records.map(mapPrismaToFiche);
      }
    }
  } catch (e) {
    console.error("Prisma getBadges error, fallback to local JSON:", e);
  }
  return getLocalBadges();
}

export async function getBadgeByToken(token: string): Promise<Fiche | null> {
  if (!token) return null;
  const cleanToken = token.trim();

  try {
    if (prisma?.badge) {
      const record = await prisma.badge.findFirst({
        where: {
          token: {
            equals: cleanToken,
            mode: "insensitive",
          },
        },
      });

      if (record) {
        return mapPrismaToFiche(record);
      }
    }
  } catch (e) {
    console.error("Prisma getBadgeByToken error, fallback to local JSON:", e);
  }

  const local = getLocalBadges();
  return local.find((b) => b.token.toLowerCase() === cleanToken.toLowerCase()) || null;
}

export async function saveBadgeToDatabase(fiche: Partial<Fiche> & { token: string }): Promise<Fiche | null> {
  const cleanToken = fiche.token.trim();

  try {
    if (prisma?.badge) {
      const existing = await prisma.badge.findFirst({
        where: {
          token: {
            equals: cleanToken,
            mode: "insensitive",
          },
        },
      });

      if (existing) {
        const mergedData: Record<string, any> = {
          ...((existing.data as any) || {}),
          ...((fiche.data as any) || {}),
        };

        const updated = await prisma.badge.update({
          where: { id: existing.id },
          data: {
            type: fiche.type || existing.type,
            isClaimed: true,
            data: mergedData as any,
            updatedAt: new Date(),
          },
        });

        return mapPrismaToFiche(updated);
      } else {
        const created = await prisma.badge.create({
          data: {
            token: cleanToken,
            claimCode: fiche.claim_code || null,
            passwordHash: fiche.password_hash || null,
            type: fiche.type || "festivalier",
            isClaimed: true,
            data: (fiche.data as any) || {},
            failedAttempts: 0,
            lockedUntil: null,
          },
        });

        return mapPrismaToFiche(created);
      }
    }
  } catch (e) {
    console.error("Prisma saveBadgeToDatabase error:", e);
  }

  // Fallback to local JSON cache
  try {
    const badges = getLocalBadges();
    const idx = badges.findIndex((b) => b.token.toLowerCase() === cleanToken.toLowerCase());
    const fallbackFiche: Fiche = {
      id: idx !== -1 ? badges[idx].id : `badge-${Date.now()}`,
      token: cleanToken,
      claim_code: fiche.claim_code || null,
      nfc_encoded_at: null,
      password_hash: null,
      type: (fiche.type as FicheType) || "festivalier",
      is_claimed: true,
      data: fiche.data || {},
      failed_attempts: 0,
      locked_until: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (idx !== -1) {
      badges[idx] = { ...badges[idx], ...fallbackFiche, data: { ...(badges[idx].data || {}), ...(fiche.data || {}) } };
    } else {
      badges.unshift(fallbackFiche);
    }
    saveBadges(badges);
    return fallbackFiche;
  } catch (e) {
    // Ignored in read-only filesystems
  }

  return {
    id: `badge-${Date.now()}`,
    token: cleanToken,
    claim_code: fiche.claim_code || null,
    nfc_encoded_at: null,
    password_hash: null,
    type: (fiche.type as FicheType) || "festivalier",
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
