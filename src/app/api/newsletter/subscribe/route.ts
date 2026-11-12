import { NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, tag, tags, dropSlug, dropTitle } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Prepare tags list
    const tagsList: string[] = Array.isArray(tags) && tags.length > 0
      ? tags.map((t: any) => String(t).trim()).filter(Boolean)
      : [String(tag || "Beta-App-Enjeu").trim()];

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
          // Add tags (e.g. ["drop", "drop-manga"])
          const tagUrl = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}/tags`;
          await fetch(tagUrl, {
            method: "POST",
            headers: {
              Authorization: `apikey ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tags: tagsList.map((t) => ({ name: t, status: "active" })),
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

    // 2. Persist in Postgres DB (Prisma Page with slug "config-newsletter-subscribers")
    if (prisma) {
      try {
        const existingPage = await prisma.page.findUnique({
          where: { slug: "config-newsletter-subscribers" },
        });

        let subscribers: any[] = [];
        if (existingPage?.content) {
          try {
            subscribers = JSON.parse(existingPage.content);
            if (!Array.isArray(subscribers)) subscribers = [];
          } catch {
            subscribers = [];
          }
        }

        const existingIdx = subscribers.findIndex((s) => s.email === cleanEmail);
        const now = new Date().toISOString();

        if (existingIdx >= 0) {
          const currentTags = Array.isArray(subscribers[existingIdx].tags)
            ? subscribers[existingIdx].tags
            : subscribers[existingIdx].tag
            ? [subscribers[existingIdx].tag]
            : [];
          const mergedTags = Array.from(new Set([...currentTags, ...tagsList]));

          subscribers[existingIdx] = {
            ...subscribers[existingIdx],
            tags: mergedTags,
            tag: mergedTags[0] || "drop",
            updatedAt: now,
            mailchimpSynced: mailchimpSuccess || subscribers[existingIdx].mailchimpSynced,
            dropSlug: dropSlug || subscribers[existingIdx].dropSlug,
            dropTitle: dropTitle || subscribers[existingIdx].dropTitle,
          };
        } else {
          subscribers.push({
            email: cleanEmail,
            tags: tagsList,
            tag: tagsList[0] || "drop",
            date: now,
            mailchimpSynced: mailchimpSuccess,
            dropSlug: dropSlug || null,
            dropTitle: dropTitle || null,
          });
        }

        await prisma.page.upsert({
          where: { slug: "config-newsletter-subscribers" },
          update: { content: JSON.stringify(subscribers) },
          create: {
            title: "Newsletter & Drop Subscribers",
            slug: "config-newsletter-subscribers",
            content: JSON.stringify(subscribers),
            status: "publish",
          },
        });
      } catch (dbErr) {
        console.warn("Prisma subscribers save warning:", dbErr);
      }
    }

    // 3. Backup: Always save subscriber locally in src/data/beta_subscribers.json
    try {
      const dataDir = path.join(process.cwd(), "src", "data");
      const filePath = path.join(dataDir, "beta_subscribers.json");

      let list: any[] = [];
      if (fs.existsSync(filePath)) {
        try {
          list = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          if (!Array.isArray(list)) list = [];
        } catch (e) {}
      }

      const existingLocal = list.find((item) => item.email === cleanEmail);
      if (existingLocal) {
        const existingTags = Array.isArray(existingLocal.tags)
          ? existingLocal.tags
          : existingLocal.tag
          ? [existingLocal.tag]
          : [];
        existingLocal.tags = Array.from(new Set([...existingTags, ...tagsList]));
        existingLocal.updatedAt = new Date().toISOString();
        if (dropSlug) existingLocal.dropSlug = dropSlug;
      } else {
        list.push({
          email: cleanEmail,
          tags: tagsList,
          tag: tagsList[0] || "drop",
          dropSlug: dropSlug || null,
          dropTitle: dropTitle || null,
          date: new Date().toISOString(),
          mailchimpSynced: mailchimpSuccess,
        });
      }

      fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf-8");
    } catch (e) {
      console.error("Local subscriber file write error:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Inscription enregistrée avec succès !",
      mailchimpSynced: mailchimpSuccess,
    });
  } catch (error: any) {
    console.error("Subscribe route error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
