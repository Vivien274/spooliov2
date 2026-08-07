import fs from "fs";
import path from "path";
import { Fiche } from "./badgeTypes";

const badgesFilePath = path.join(process.cwd(), "src/data/badges.json");

const DEFAULT_BADGES: Fiche[] = [
  {
    id: "badge-demo-01",
    token: "DEMO123",
    claim_code: "123456",
    nfc_encoded_at: new Date().toISOString(),
    password_hash: null,
    type: "festivalier",
    is_claimed: true,
    data: {
      prenom: "Alex",
      intro: "Passionné d'impression 3D & Fidgets Spoolio !",
      contact1_nom: "Marie (Proche)",
      contact1_tel: "06 12 34 56 78",
      contact2_nom: "Thomas (Frère)",
      contact2_tel: "06 98 76 54 32",
      infos_medicales: "Aucune allergie connue",
      groupe_sanguin: "O+",
      camping: "Zone A - Stand Spoolio",
      langues: "Français, Anglais",
      message: "Scannez ce badge pour m'identifier !"
    },
    failed_attempts: 0,
    locked_until: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export function getBadges(): Fiche[] {
  try {
    if (!fs.existsSync(badgesFilePath)) {
      const dir = path.dirname(badgesFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(badgesFilePath, JSON.stringify(DEFAULT_BADGES, null, 2), "utf8");
      return DEFAULT_BADGES;
    }
    const fileContent = fs.readFileSync(badgesFilePath, "utf8");
    return JSON.parse(fileContent);
  } catch (e) {
    console.error("Error reading badges.json:", e);
    return DEFAULT_BADGES;
  }
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

export function getBadgeByToken(token: string): Fiche | null {
  const badges = getBadges();
  return badges.find((b) => b.token.toLowerCase() === token.toLowerCase()) || null;
}
