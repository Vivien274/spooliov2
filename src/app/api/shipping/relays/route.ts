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

    // Return realistic mocked Relay Points for demo & integration tests
    let simulatedRelays = [];

    if (cp === "59560") {
      simulatedRelays = [
        {
          id: "MR-59560-01",
          name: "Locker LIDL Comines",
          address: "224 Rue d'Armentières",
          cp: "59560",
          ville: "Comines"
        },
        {
          id: "MR-59560-02",
          name: "Hygie Meca Comines",
          address: "114 Rue de la Lys",
          cp: "59560",
          ville: "Comines"
        },
        {
          id: "MR-59560-03",
          name: "Tabac Presse Saint-Michel",
          address: "18 Rue du Hoccart",
          cp: "59560",
          ville: "Comines"
        },
        {
          id: "MR-59560-04",
          name: "Boulangerie du Centre",
          address: "42 Grand Place",
          cp: "59560",
          ville: "Comines"
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
      ];
    }

    return NextResponse.json({ success: true, relays: simulatedRelays });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message || "Erreur lors de la récupération des points relais." },
      { status: 500 }
    );
  }
}
