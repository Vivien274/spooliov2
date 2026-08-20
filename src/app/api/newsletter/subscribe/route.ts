import { NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, tag = "Beta-App-Enjeu" } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const apiKey = process.env.MAILCHIMP_API_KEY;
    const listId = process.env.MAILCHIMP_LIST_ID;
    const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX || (apiKey ? apiKey.split("-")[1] : null);

    let mailchimpSuccess = false;

    // 1. Try Mailchimp API v3 if credentials are provided
    if (apiKey && listId && serverPrefix) {
      try {
        const subscriberHash = crypto.createHash("md5").update(cleanEmail).digest("hex");

        // Add or update member in audience
        const memberUrl = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}`;
        const memberRes = await fetch(memberUrl, {
          method: "PUT",
          headers: {
            Authorization: `apikey ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email_address: cleanEmail,
            status_if_new: "subscribed",
          }),
        });

        if (memberRes.ok) {
          // Add tag (e.g. "Beta-App-Enjeu")
          const tagUrl = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}/tags`;
          await fetch(tagUrl, {
            method: "POST",
            headers: {
              Authorization: `apikey ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tags: [{ name: tag, status: "active" }],
            }),
          });
          mailchimpSuccess = true;
        } else {
          console.warn("Mailchimp API error response:", await memberRes.text());
        }
      } catch (err) {
        console.error("Mailchimp API request error:", err);
      }
    }

    // 2. Backup: Always save subscriber locally in src/data/beta_subscribers.json
    try {
      const dataDir = path.join(process.cwd(), "src", "data");
      const filePath = path.join(dataDir, "beta_subscribers.json");

      let list: any[] = [];
      if (fs.existsSync(filePath)) {
        try {
          list = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        } catch (e) {}
      }

      if (!list.some((item) => item.email === cleanEmail)) {
        list.push({
          email: cleanEmail,
          tag,
          date: new Date().toISOString(),
          mailchimpSynced: mailchimpSuccess,
        });
        fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf-8");
      }
    } catch (e) {
      console.error("Local subscriber file write error:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Inscription à la béta réussie !",
      mailchimpSynced: mailchimpSuccess,
    });
  } catch (error: any) {
    console.error("Subscribe route error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
