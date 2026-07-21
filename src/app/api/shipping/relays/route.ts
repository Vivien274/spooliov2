import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cp = searchParams.get("cp")?.trim();

    if (!cp || cp.length < 3) {
      return NextResponse.json(
        { error: "Veuillez spécifier un code postal valide." },
        { status: 400 }
      );
    }

    const enseigne = process.env.MONDIAL_RELAY_ENSEIGNE || "BDTEST  ";
    const privateKey = process.env.MONDIAL_RELAY_KEY || "PrivateK";
    const pays = cp.length === 4 ? "BE" : "FR";
    const ville = "";
    const taille = "";
    const poids = "";
    const action = "";
    const delaiEnvoi = "";
    const rayon = "20";
    const nombreResultats = "10";

    // Security MD5 key calculation: Enseigne + Pays + CP + Ville + Taille + Poids + Action + DelaiEnvoi + Rayon + NombreResultats + PrivateKey
    const paramsString = `${enseigne}${pays}${cp}${ville}${taille}${poids}${action}${delaiEnvoi}${rayon}${nombreResultats}${privateKey}`;
    const securityKey = crypto.createHash("md5").update(paramsString).digest("hex").toUpperCase();

    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <WSI4_PointRelais_Recherche xmlns="http://www.mondialrelay.fr/webservice/">
      <Enseigne>${enseigne}</Enseigne>
      <Pays>${pays}</Pays>
      <CP>${cp}</CP>
      <Ville>${ville}</Ville>
      <Taille>${taille}</Taille>
      <Poids>${poids}</Poids>
      <Action>${action}</Action>
      <DelaiEnvoi>${delaiEnvoi}</DelaiEnvoi>
      <Rayon>${rayon}</Rayon>
      <NombreResultats>${nombreResultats}</NombreResultats>
      <Security>${securityKey}</Security>
    </WSI4_PointRelais_Recherche>
  </soap:Body>
</soap:Envelope>`;

    const soapResponse = await fetch("https://api.mondialrelay.com/WebServices/WSI4_PointRelais.asmx", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "http://www.mondialrelay.fr/webservice/WSI4_PointRelais_Recherche"
      },
      body: soapEnvelope
    });

    if (!soapResponse.ok) {
      throw new Error(`Mondial Relay Web Service returned HTTP status ${soapResponse.status}`);
    }

    const xmlResponse = await soapResponse.text();
    
    // Extract PointRelais_Detail blocks
    const blocks = xmlResponse.match(/<PointRelais_Detail>([\s\S]*?)<\/PointRelais_Detail>/g) || [];

    const realRelays = blocks.map((block) => {
      const getValue = (tag: string) => {
        const match = block.match(new RegExp(`<${tag}>([^<]*?)<\/${tag}>`));
        return match ? match[1].trim() : "";
      };

      const id = getValue("Num");
      const name = getValue("LgAdr1");
      const address = getValue("LgAdr3");
      const cpVal = getValue("CP");
      const villeVal = getValue("Ville");
      const latRaw = getValue("Latitude").replace(",", ".");
      const lngRaw = getValue("Longitude").replace(",", ".");

      return {
        id: `MR-${id}`,
        name,
        address,
        cp: cpVal,
        ville: villeVal,
        latitude: latRaw,
        longitude: lngRaw
      };
    });

    return NextResponse.json({ success: true, relays: realRelays });
  } catch (e: any) {
    console.error("Mondial Relay Integration Error:", e);
    return NextResponse.json(
      { success: false, error: e.message || "Erreur lors de la récupération des points relais." },
      { status: 500 }
    );
  }
}
