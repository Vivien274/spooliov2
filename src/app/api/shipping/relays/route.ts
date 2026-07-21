import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Fallback generator for realistic local relay points based on postal code
async function generateFallbackRelays(cp: string) {
  let city = "Ville Partenaire";
  if (cp.startsWith("59")) {
    city = cp === "59560" ? "Comines" : (cp === "59000" ? "Lille" : "Roubaix");
  } else if (cp.startsWith("75")) {
    city = "Paris";
  } else if (cp.startsWith("69")) {
    city = "Lyon";
  } else if (cp.startsWith("13")) {
    city = "Marseille";
  } else if (cp.startsWith("44")) {
    city = "Nantes";
  } else if (cp.startsWith("33")) {
    city = "Bordeaux";
  } else if (cp.startsWith("1000") || cp.startsWith("1030")) {
    city = "Bruxelles";
  }

  // Fetch coordinates of postal code using government API
  let baseLat = 50.7667; // Default to Comines coordinates
  let baseLng = 3.0075;
  try {
    const geoRes = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${cp}&postcode=${cp}&limit=1`);
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      const coords = geoData.features?.[0]?.geometry?.coordinates;
      if (coords && coords.length === 2) {
        baseLng = coords[0];
        baseLat = coords[1];
      }
    }
  } catch (e) {
    console.warn("Geocoding failed, using fallbacks:", e);
  }

  const offsetCoordinates = (index: number) => {
    const offsetLat = (index - 2) * 0.0035 + (Math.random() - 0.5) * 0.001;
    const offsetLng = ((index % 2) - 0.5) * 0.007 + (Math.random() - 0.5) * 0.001;
    return {
      lat: (baseLat + offsetLat).toFixed(6),
      lng: (baseLng + offsetLng).toFixed(6)
    };
  };

  const simulated = [
    {
      id: `MR-${cp}-01`,
      name: "Tabac Presse Saint-Michel",
      address: "18 Rue de la Gare",
      cp: cp,
      ville: city
    },
    {
      id: `MR-${cp}-02`,
      name: "Boulangerie du Centre",
      address: "42 Place de la Mairie",
      cp: cp,
      ville: city
    },
    {
      id: `MR-${cp}-03`,
      name: "L'Épicerie Fine",
      address: "115 Rue des Lilas",
      cp: cp,
      ville: city
    },
    {
      id: `MR-${cp}-04`,
      name: "Fleuriste Cœur de Pétale",
      address: "5 Avenue Pasteur",
      cp: cp,
      ville: city
    },
    {
      id: `MR-${cp}-05`,
      name: "Presse et Loto des Arcades",
      address: "8 Place Verte",
      cp: cp,
      ville: city
    }
  ].map((relay, idx) => {
    const coords = offsetCoordinates(idx);
    return {
      ...relay,
      latitude: coords.lat,
      longitude: coords.lng
    };
  });

  return simulated;
}

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

    const enseigne = process.env.MONDIAL_RELAY_ENSEIGNE;
    const privateKey = process.env.MONDIAL_RELAY_KEY;

    // If API credentials are not provided yet in env, bypass and return fallback relays directly
    if (!enseigne || !privateKey) {
      console.log(`[Mondial Relay] Credentials missing. Returning realistic fallback relays for zip ${cp}...`);
      const fallback = await generateFallbackRelays(cp);
      return NextResponse.json({ success: true, relays: fallback, isDemoMode: true });
    }

    const pays = cp.length === 4 ? "BE" : "FR";
    const numPointRelais = "";
    const ville = "";
    const latitude = "";
    const longitude = "";
    const taille = "";
    const poids = "";
    const action = "";
    const delaiEnvoi = "0";
    const rayonRecherche = "20";
    const nombreResultats = "10";

    const paramsString = `${enseigne}${pays}${numPointRelais}${ville}${cp}${latitude}${longitude}${taille}${poids}${action}${delaiEnvoi}${rayonRecherche}${nombreResultats}${privateKey}`;
    const securityKey = crypto.createHash("md5").update(paramsString).digest("hex").toUpperCase();

    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <WSI4_PointRelais_Recherche xmlns="http://www.mondialrelay.fr/webservice/">
      <Enseigne>${enseigne}</Enseigne>
      <Pays>${pays}</Pays>
      <NumPointRelais>${numPointRelais}</NumPointRelais>
      <Ville>${ville}</Ville>
      <CP>${cp}</CP>
      <Latitude>${latitude}</Latitude>
      <Longitude>${longitude}</Longitude>
      <Taille>${taille}</Taille>
      <Poids>${poids}</Poids>
      <Action>${action}</Action>
      <DelaiEnvoi>${delaiEnvoi}</DelaiEnvoi>
      <RayonRecherche>${rayonRecherche}</RayonRecherche>
      <NombreResultats>${nombreResultats}</NombreResultats>
      <Security>${securityKey}</Security>
    </WSI4_PointRelais_Recherche>
  </soap:Body>
</soap:Envelope>`;

    let realRelays: any[] = [];
    let isSoapError = false;

    try {
      const soapResponse = await fetch("https://api.mondialrelay.com/Web_Services.asmx", {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          "SOAPAction": "http://www.mondialrelay.fr/webservice/WSI4_PointRelais_Recherche"
        },
        body: soapEnvelope
      });

      if (soapResponse.ok) {
        const xmlResponse = await soapResponse.text();
        
        // Check if response contains an error code in <STAT> (e.g. 95)
        const statMatch = xmlResponse.match(/<STAT>(\d+)<\/STAT>/);
        const statCode = statMatch ? statMatch[1] : "0";

        if (statCode !== "0") {
          console.warn(`[Mondial Relay API Error] Server returned STAT code: ${statCode}. Falling back to simulated relays...`);
          isSoapError = true;
        } else {
          const blocks = xmlResponse.match(/<PointRelais_Detail>([\s\S]*?)<\/PointRelais_Detail>/g) || [];
          realRelays = blocks.map((block) => {
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
        }
      } else {
        console.warn(`[Mondial Relay SOAP Error] HTTP status: ${soapResponse.status}. Falling back...`);
        isSoapError = true;
      }
    } catch (soapErr) {
      console.error("[Mondial Relay SOAP Request Failed] Falling back...", soapErr);
      isSoapError = true;
    }

    // Apply fallback if soap request failed or returned an API error (like STAT 95)
    if (isSoapError || realRelays.length === 0) {
      const fallback = await generateFallbackRelays(cp);
      return NextResponse.json({ success: true, relays: fallback, isDemoMode: true });
    }

    return NextResponse.json({ success: true, relays: realRelays });
  } catch (e: any) {
    console.error("Global shipping relays API error, returning basic fallbacks:", e);
    const cp = new URL(request.url).searchParams.get("cp")?.trim() || "59560";
    const fallback = await generateFallbackRelays(cp);
    return NextResponse.json({ success: true, relays: fallback, isDemoMode: true });
  }
}
