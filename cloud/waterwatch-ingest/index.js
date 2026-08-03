import { XMLParser } from "fast-xml-parser";
import { Firestore } from "@google-cloud/firestore";
import { PubSub } from "@google-cloud/pubsub";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
const firestore = new Firestore();
const pubsub = new PubSub();

const COLLECTION = "waterWatchEntries";
const TOPIC = "waterwatch.alerts";

export async function ingestFeeds(request, response) {
  try {
    const sources = JSON.parse(process.env.WATERWATCH_SOURCES || "[]");
    if (!Array.isArray(sources) || sources.length === 0) {
      throw new Error("WATERWATCH_SOURCES env var missing JSON array of feed configs.");
    }

    const entries = [];
    for (const source of sources) {
      if (source.type !== "rss") continue;
      try {
        const fetched = await fetchRss(source);
        entries.push(...fetched);
      } catch (error) {
        console.warn(`Failed ${source.label}:`, error.message);
      }
    }

    if (entries.length === 0) {
      response.status(200).json({ message: "No entries harvested." });
      return;
    }

    const batch = firestore.batch();
    for (const entry of entries) {
      const ref = firestore.collection(COLLECTION).doc(entry.id);
      batch.set(ref, entry, { merge: true });
      await publish(TOPIC, entry);
    }
    await batch.commit();

    response.status(200).json({ message: `Stored ${entries.length} entries.` });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: error.message });
  }
}

async function fetchRss(source) {
  const res = await fetch(source.url, {
    headers: {
      "user-agent": "MissionPureWaterWatch/1.0",
    },
  });
  if (!res.ok) throw new Error(`Bad status ${res.status}`);
  const xml = await res.text();
  const data = parser.parse(xml);
  const items = ensureArray(data?.rss?.channel?.item);
  return items
    .slice(0, source.limit || 3)
    .map((item) => normalizeRssItem(item, source))
    .filter(Boolean);
}

function normalizeRssItem(item, source) {
  const title = String(item.title || "Untitled").trim();
  const description = String(item.description || item.summary || "").replace(/<[^>]+>/g, " ").trim();
  const publishedAt = item.pubDate || item.updated || new Date().toISOString();
  const link = String(item.link || source.url).trim();

  const haystack = `${title} ${description}`.toLowerCase();
  const keywords = source.keywords || [];
  const hasKeyword = keywords.length === 0 || keywords.some((kw) => haystack.includes(kw.toLowerCase()));
  if (!hasKeyword) return null;

  return {
    id: `${source.id}-${Buffer.from(title).toString("base64").slice(0, 16)}`,
    sourceId: source.id,
    sourceLabel: source.label,
    city: source.city,
    title,
    summary: description.slice(0, 400),
    url: link,
    publishedAt: new Date(publishedAt).toISOString(),
    tags: source.tags || [],
    createdAt: new Date().toISOString(),
  };
}

function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
}

async function publish(topicName, data) {
  const dataBuffer = Buffer.from(JSON.stringify(data));
  await pubsub.topic(topicName).publishMessage({ data: dataBuffer });
}
