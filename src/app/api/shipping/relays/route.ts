import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cp = searchParams.get("cp");

    if (!cp || cp.length < 3) {
      return NextResponse.json(
        { error: "Veuillez spécifier un code postal valide." },
        { status: 400 }
      );
    }

    // Simulate database or API latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Simple dictionary matching city names to make the simulation look premium
    let city = "Ville Partenaire";
    const cpNum = parseInt(cp);
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
      city = "Bruxelles (Belgique)";
    }

    // Fetch coordinate of postal code using government API
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
      // Small offsets to disperse markers around base coordinates
      const offsetLat = (index - 2) * 0.0035 + (Math.random() - 0.5) * 0.001;
      const offsetLng = ((index % 2) - 0.5) * 0.007 + (Math.random() - 0.5) * 0.001;
      return {
        lat: (baseLat + offsetLat).toFixed(6),
        lng: (baseLng + offsetLng).toFixed(6)
      };
    };

    // Return realistic mocked Relay Points for demo & integration tests
    let simulatedRelays = [];

    if (cp === "59560") {
      simulatedRelays = [
        {
          id: "MR-59560-01",
          name: "Locker LIDL Comines",
          address: "224 Rue d'Armentières",
          cp: "59560",
          ville: "Comines",
          latitude: "50.763421",
          longitude: "3.004523"
        },
        {
          id: "MR-59560-02",
          name: "Hygie Meca Comines",
          address: "114 Rue de la Lys",
          cp: "59560",
          ville: "Comines",
          latitude: "50.762100",
          longitude: "3.011244"
        },
        {
          id: "MR-59560-03",
          name: "Tabac Presse Saint-Michel",
          address: "18 Rue du Hoccart",
          cp: "59560",
          ville: "Comines",
          latitude: "50.768102",
          longitude: "3.006122"
        },
        {
          id: "MR-59560-04",
          name: "Boulangerie du Centre",
          address: "42 Grand Place",
          cp: "59560",
          ville: "Comines",
          latitude: "50.765123",
          longitude: "3.007554"
        }
      ];
    } else {
      simulatedRelays = [
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
    }

    return NextResponse.json({ success: true, relays: simulatedRelays });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message || "Erreur lors de la récupération des points relais." },
      { status: 500 }
    );
  }
}
